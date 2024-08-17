import { IsoLanguage } from "./IsoLanguage";
import { Translatable } from "./Translatable";
import { TranslationError } from "./TranslationError";
import { TranslationStep } from "./TranslationStep";

/**
 * A path through the translation graph (a set of translation steps)
 * that translates messages from the source language to the target language
 */
export class TranslationPath {
  /**
   * The language from which this step translates
   */
  readonly origin: IsoLanguage;

  /**
   * The language to which this step translates
   */
  readonly target: IsoLanguage;

  /**
   * The steps along the translation path
   */
  readonly steps: TranslationStep[];

  constructor(steps: TranslationStep[]) {
    if (steps.length < 1) {
      throw Error("There must be at least one step in a translation path.");
    }

    let currentLanguage = steps[0].origin;
    this.origin = currentLanguage;

    for (const step of steps) {
      if (currentLanguage !== step.origin) {
        throw Error("Languages along the translation path do not match.");
      }
      currentLanguage = step.target;
    }

    this.target = currentLanguage;
    this.steps = steps;
  }

  /**
   * Execute the translation on a given message
   */
  public async executeOn(
    translatable: Translatable,
  ): Promise<Translatable | TranslationError> {
    for (const step of this.steps) {
      const intermediateResult = await step.executeOn(translatable);

      if (intermediateResult instanceof TranslationError) {
        return intermediateResult;
      } else {
        translatable = intermediateResult;
      }
    }

    return translatable;
  }
}
