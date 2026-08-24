import { psychologistsService } from "@psikosanal/core";

export type PsychologistSort = psychologistsService.PsychologistSort;
export type PsychologistFilters = psychologistsService.PsychologistFilters;

export const getApprovedPsychologists = psychologistsService.getApprovedPsychologists;
export const getPsychologistBySlug = psychologistsService.getPsychologistBySlug;
export const getApprovedPsychologistSlugs = psychologistsService.getApprovedPsychologistSlugs;
export const getPsychologistById = psychologistsService.getPsychologistById;
export const getPsychologistByUserId = psychologistsService.getPsychologistByUserId;
export const getPendingApplications = psychologistsService.getPendingApplications;
export const getPsychologistApplicationById = psychologistsService.getPsychologistApplicationById;
export const getAllPsychologists = psychologistsService.getAllPsychologists;
export const countPendingApplications = psychologistsService.countPendingApplications;
