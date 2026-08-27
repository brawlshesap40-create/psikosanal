import { psychTestsService } from "@psikosanal/core";

export const listTests = psychTestsService.listTests;
export const getTestBySlugWithQuestions = psychTestsService.getTestBySlugWithQuestions;
export const scoreAnswers = psychTestsService.scoreAnswers;
export type ResultBand = psychTestsService.ResultBand;
