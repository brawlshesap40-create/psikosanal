export const LANGUAGE_OPTIONS = ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Arapça"] as const;

export const APPROACH_OPTIONS = [
  "Bilişsel Davranışçı Terapi",
  "Psikodinamik Terapi",
  "Şema Terapi",
  "EMDR",
  "Kabul ve Kararlılık Terapisi",
  "Aile Sistemleri Terapisi",
] as const;

export const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: "kadin", label: "Kadın" },
  { value: "erkek", label: "Erkek" },
  { value: "belirtilmemis", label: "Belirtilmemiş" },
];
