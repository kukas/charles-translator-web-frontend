import { IsoLanguage } from "./IsoLanguage";
import { MessageInputMethod } from "./MessageInputMethod";
import { Translatable } from "./Translatable";
import { User } from "./User";

/**
 * A message in a specific language that can be translated to some other language
 */
export class Message extends Translatable {
  /**
   * Plain-text body of the message
   */
  public readonly text: string;

  constructor(data: {
    language: IsoLanguage;
    text: string;
    author: User;
    isOriginal: boolean;
    originalInputMethod: MessageInputMethod;
  }) {
    super(
      data.language,
      data.author,
      data.isOriginal,
      data.originalInputMethod,
    );
    this.text = data.text;
  }

  public makeTranslation(newLanguage: IsoLanguage, newText: string): Message {
    return new Message({
      language: newLanguage,
      text: newText,
      author: this.author,
      isOriginal: false, // it's been translated so it's definitely not original
      originalInputMethod: this.originalInputMethod,
    });
  }
}
