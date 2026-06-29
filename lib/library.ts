export type ChordDefinition = {
  name: string;
  notes: string[];
  diagram: string[];
  family: string;
};

export type ScaleDefinition = {
  name: string;
  category: string;
  notes: string[];
  positions: string[];
  diagram: string[];
};

export const CHORD_LIBRARY: ChordDefinition[] = [
  { name: "A", notes: ["A", "C#", "E"], family: "Major", diagram: ["E|---0---", "B|---2---", "G|---2---", "D|---2---", "A|---0---", "E|---X---"] },
  { name: "Am", notes: ["A", "C", "E"], family: "Minor", diagram: ["E|---0---", "B|---1---", "G|---2---", "D|---2---", "A|---0---", "E|---X---"] },
  { name: "A7", notes: ["A", "C#", "E", "G"], family: "Dominant", diagram: ["E|---0---", "B|---2---", "G|---0---", "D|---2---", "A|---0---", "E|---X---"] },
  { name: "Am7", notes: ["A", "C", "E", "G"], family: "Minor 7", diagram: ["E|---0---", "B|---1---", "G|---0---", "D|---2---", "A|---0---", "E|---X---"] },
  { name: "Amaj7", notes: ["A", "C#", "E", "G#"], family: "Major 7", diagram: ["E|---0---", "B|---2---", "G|---1---", "D|---2---", "A|---0---", "E|---X---"] },
  { name: "Aadd9", notes: ["A", "C#", "E", "B"], family: "Add", diagram: ["E|---0---", "B|---0---", "G|---2---", "D|---2---", "A|---0---", "E|---X---"] },
  { name: "C", notes: ["C", "E", "G"], family: "Major", diagram: ["E|---0---", "B|---1---", "G|---0---", "D|---2---", "A|---3---", "E|---X---"] },
  { name: "D", notes: ["D", "F#", "A"], family: "Major", diagram: ["E|---2---", "B|---3---", "G|---2---", "D|---0---", "A|---X---", "E|---X---"] },
  { name: "Dm", notes: ["D", "F", "A"], family: "Minor", diagram: ["E|---1---", "B|---3---", "G|---2---", "D|---0---", "A|---X---", "E|---X---"] },
  { name: "E", notes: ["E", "G#", "B"], family: "Major", diagram: ["E|---0---", "B|---0---", "G|---1---", "D|---2---", "A|---2---", "E|---0---"] },
  { name: "Em", notes: ["E", "G", "B"], family: "Minor", diagram: ["E|---0---", "B|---0---", "G|---0---", "D|---2---", "A|---2---", "E|---0---"] },
  { name: "F", notes: ["F", "A", "C"], family: "Major", diagram: ["E|---1---", "B|---1---", "G|---2---", "D|---3---", "A|---3---", "E|---1---"] },
  { name: "G", notes: ["G", "B", "D"], family: "Major", diagram: ["E|---3---", "B|---0---", "G|---0---", "D|---0---", "A|---2---", "E|---3---"] },
];

export const SCALE_LIBRARY: ScaleDefinition[] = [
  { name: "C Major", category: "Major", notes: ["C", "D", "E", "F", "G", "A", "B"], positions: ["Open", "5. pozisyon", "8. pozisyon"], diagram: ["E|--0--1--3--", "B|--0--1--3--", "G|--0--2-----", "D|--0--2--3--", "A|--0--2--3--", "E|--0--1--3--"] },
  { name: "A Minor", category: "Minor", notes: ["A", "B", "C", "D", "E", "F", "G"], positions: ["Open", "5. pozisyon"], diagram: ["E|--0--1--3--", "B|--0--1--3--", "G|--0--2-----", "D|--0--2--3--", "A|--0--2--3--", "E|--0--1--3--"] },
  { name: "A Minor Pentatonic", category: "Pentatonik", notes: ["A", "C", "D", "E", "G"], positions: ["5. pozisyon", "8. pozisyon"], diagram: ["E|--5--8--", "B|--5--8--", "G|--5--7--", "D|--5--7--", "A|--5--7--", "E|--5--8--"] },
  { name: "A Blues", category: "Blues", notes: ["A", "C", "D", "D#", "E", "G"], positions: ["5. pozisyon"], diagram: ["E|--5--8--", "B|--5--8--", "G|--5--7--8--", "D|--5--7--", "A|--5--6--7--", "E|--5--8--"] },
  { name: "D Dorian", category: "Mod", notes: ["D", "E", "F", "G", "A", "B", "C"], positions: ["10. pozisyon"], diagram: ["E|--10--12--13--", "B|--10--12--13--", "G|--10--12--", "D|--10--12--14--", "A|--10--12--14--", "E|--10--12--13--"] },
  { name: "G Mixolydian", category: "Mod", notes: ["G", "A", "B", "C", "D", "E", "F"], positions: ["3. pozisyon"], diagram: ["E|--3--5--6--", "B|--3--5--6--", "G|--2--4--5--", "D|--2--3--5--", "A|--2--3--5--", "E|--3--5--6--"] },
];

export const THEORY_TOPICS = [
  ["Nota sistemi", "Gitar klavyesindeki her perde yarim ses ilerler. Ayni notayi farkli tellerde bulmak pozisyon hakimiyetini guclendirir."],
  ["Araliklar", "Iki nota arasindaki mesafe araliktir. Akor ve gamlari anlamanin temel dili budur."],
  ["Akor olusumu", "Triad akorlar kok, ucuncu ve besinci dereceden olusur. Yedili ve add akorlar bu yapinin uzerine eklenir."],
  ["Major gam", "Major gamin aralik dizilimi tam, tam, yarim, tam, tam, tam, yarim seklindedir."],
  ["Minor gam", "Dogal minor gam major gama gore daha karanlik duyulur ve 6. dereceden baslayan mod gibi dusunulebilir."],
  ["Pentatonik", "Bes notali pratik gam yapisidir. Solo, motif ve kulak calismasi icin cok kullanislidir."],
  ["Modlar", "Modlar ayni nota havuzunun farkli merkezler etrafinda duyulmasidir."],
  ["Circle of Fifths", "Tonlarin birbirine yakinligini, diyez ve bemol sayilarini ve akor iliskilerini gosterir."],
  ["Ritim bilgisi", "Sure, vurgu ve suslar muzik cumlesinin akisini belirler."],
  ["Olculer", "4/4, 3/4 ve 6/8 gibi olculer vuruslarin nasil gruplandigini anlatir."],
  ["Transpoze mantigi", "Bir sarkiyi transpoze ederken tum akor kokleri ayni yarim ses miktari kadar hareket eder."],
];
