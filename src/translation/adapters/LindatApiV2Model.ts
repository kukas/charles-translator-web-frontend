import { IsoLanguage } from "../domain/IsoLanguage";
import { Document } from "../domain/Document";
import { Message } from "../domain/Message";
import { Translatable } from "../domain/Translatable";
import { TranslationError } from "../domain/TranslationError";
import { TranslationErrorCode } from "../domain/TranslationErrorCode";
import { TranslationStep } from "../domain/TranslationStep";

// TODO: Replace this with the actual API URL
const BASE_API_URL = "http://localhost:5000/api/v2/languages/";

const API_URL = BASE_API_URL + "?frontend=u4u";

export const MAX_CONTENT_LENGTH = 5000 * 1024; // should match MAX_CONTENT_LENGTH in the backend
export const MAX_CONTENT_LENGTH_MB = Math.round(MAX_CONTENT_LENGTH / 1e6);

export class LindatApiV2Model implements TranslationStep {
  readonly origin: IsoLanguage;
  readonly target: IsoLanguage;

  constructor(origin: IsoLanguage, target: IsoLanguage) {
    this.origin = origin;
    this.target = target;
  }

  private async handleErrorResponse(
    error: Error | TranslationError,
  ): Promise<TranslationError> {
    // NOTE: TranslationError is not an instance of Error, hence the type

    if (error instanceof SyntaxError) {
      return new TranslationError(
        TranslationErrorCode.InvalidServerResponseFormat,
        "The response from the backend server has unexpected format.",
      );
    }

    if (error instanceof Error) {
      return new TranslationError(
        TranslationErrorCode.Failed,
        `Backend request failed: [${error.name}] ${error.message}`,
      );
    }

    return new TranslationError(
      TranslationErrorCode.Failed,
      "Backend request failed.",
    );
  }

  private async translateMessage(
    message: Message,
  ): Promise<Message | TranslationError> {
    // skip the API request for empty messages
    if (message.text.trim() === "") {
      return message.makeTranslation(this.target, "");
    }

    const normalizedMessageText = message.text.normalize("NFC");
    const encodedLoggingConsent = message.author.acceptsDataCollection
      ? "true"
      : "false";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          input_text: normalizedMessageText,
          logInput: encodedLoggingConsent,
          inputType: message.inputMethod,
          author: message.author.organizationName,
          src: this.origin,
          tgt: this.target,
        }),
      });

      if (response.ok) {
        const segments = (await response.json()) as string[];
        const translatedText = segments.join(" ");
        return message.makeTranslation(this.target, translatedText);
      }

      if (response.status === 413) {
        return new TranslationError(
          TranslationErrorCode.MessageTooLarge,
          "Message to be translated is too large.",
        );
      }

      if (response.status === 504) {
        return new TranslationError(
          TranslationErrorCode.TranslationTimeout,
          "Translation process took too long and timed out.",
        );
      }

      return new TranslationError(
        TranslationErrorCode.Failed,
        "Translation backend responded with a non-200 status code.",
      );
    } catch (error) {
      return this.handleErrorResponse(error);
    }
  }

  private async translateDocument(
    document: Document,
  ): Promise<Document | TranslationError> {
    const data = new FormData();
    data.append("input_text", document.file);
    data.append("src", this.origin);
    data.append("tgt", this.target);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const blob = await response.blob();
        const filename = document.file.name.split(".");
        const new_name = filename[0] + "." + this.target + "." + filename[1];
        const translated_file = new File([blob], new_name, {
          type: blob.type,
        });

        return document.makeTranslation(this.target, translated_file);
      }

      if (response.status === 413) {
        const json = await response.json();
        if (json.message === "The data value transmitted exceeds the capacity limit.") {
          return new TranslationError(
            TranslationErrorCode.MessageTooLarge,
            `Error: The document exceeds the maximum file size of ${MAX_CONTENT_LENGTH_MB}MB. Please reduce the file size and try again.`,
          );
        }
        if (json.message === "The total text length in the document exceeds the translation limit.") {
        return new TranslationError(
          TranslationErrorCode.MessageTooLarge,
            "Error: The document contains too much text to translate. The maximum allowed text length is 100kB. Please shorten the text and try again.",
        );
        }
      }

      if (response.status === 415) {
        return new TranslationError(
          TranslationErrorCode.UnsupportedFileType,
          "Error: Document file type is not supported.",
        );
      }
      if (response.status === 504) {
        return new TranslationError(
          TranslationErrorCode.TranslationTimeout,
          "Error: Translation process took too long and timed out.",
        );
      }

      return new TranslationError(
        TranslationErrorCode.Failed,
        "Error: Translation backend responded with a non-200 status code.",
      );
    } catch (error) {
      return this.handleErrorResponse(error);
    }
  }

  public async executeOn(
    message: Translatable,
  ): Promise<Translatable | TranslationError> {
    if (message.language !== this.origin) {
      throw Error(
        `The given message language is '${message.language}' ` +
          `but this translation step expects '${this.origin}'.`,
      );
    }

    if (message instanceof Message) {
      return this.translateMessage(message);
    }

    if (message instanceof Document) {
      return this.translateDocument(message);
    }

    throw Error("Unsupported message type.");
  }
}
