import { IsoLanguage } from "./IsoLanguage";
import { MessageInputMethod } from "./MessageInputMethod";
import { User } from "./User";

export abstract class Translatable {
  /**
   * What language is this message written in
   */
  public readonly language: IsoLanguage;

  /**
   * The author of the message (a translation system user)
   * It's the original author of the message in the language in which the
   * message entered the system.
   */
  public readonly author: User;

  /**
   * Is this message the original message entered by the user,
   * or an already translated message produced by some translation step?
   * (originality is tracked with regards to pivoted translation only,
   * not saved translations in history or any other way)
   */
  public readonly isOriginal: boolean;

  /**
   * The method by which the original message was created
   */
  public readonly originalInputMethod: MessageInputMethod;

  /**
   * Input method by which this message was created
   */
  public get inputMethod(): MessageInputMethod {
    if (this.isOriginal) {
      return this.originalInputMethod;
    }
    return MessageInputMethod.Translation;
  }

  constructor(
    language: IsoLanguage,
    author: User,
    isOriginal: boolean,
    originalInputMethod: MessageInputMethod,
  ) {
    this.language = language;
    this.author = author;
    this.isOriginal = isOriginal;
    this.originalInputMethod = originalInputMethod;

    if (
      this.originalInputMethod === MessageInputMethod.Translation &&
      this.isOriginal
    ) {
      throw Error(
        "Original message cannot have been created by previous translation.",
      );
    }
  }
}
