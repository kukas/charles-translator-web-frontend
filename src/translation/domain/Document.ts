import { IsoLanguage } from "./IsoLanguage";
import { MessageInputMethod } from "./MessageInputMethod";
import { Translatable } from "./Translatable";
import { User } from "./User";

/**
 * A message in a specific language that can be translated to some other language
 */
export class Document extends Translatable {
  /**
   * File object containing the document
   */
  public readonly file: File;

  constructor(data: {
    language: IsoLanguage;
    file: File;
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
    this.file = data.file;
  }

  public makeTranslation(newLanguage: IsoLanguage, newFile: File): Document {
    return new Document({
      language: newLanguage,
      file: newFile,
      author: this.author,
      isOriginal: false, // it's been translated so it's definitely not original
      originalInputMethod: this.originalInputMethod,
    });
  }
}
