from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class IconicSong:
    title: str
    artist: str
    fallback_reason: str


# Curated iconic songs per learning language (10 per language).
# Selected for: cultural significance, clear pronunciation, interesting vocabulary, singability.
ICONIC_SONGS: Dict[str, List[IconicSong]] = {
    "en": [
        IconicSong("Bohemian Rhapsody", "Queen", "A genre-bending 6-minute epic that blends rock opera, ballad, and hard rock. Its theatrical style and memorable phrases make it perfect for dramatic reading practice."),
        IconicSong("Imagine", "John Lennon", "A timeless peace anthem with simple vocabulary and slow pace. The lyrics use basic conditionals ('imagine there's no heaven') — great for grammar practice."),
        IconicSong("Billie Jean", "Michael Jackson", "The King of Pop's signature track with clear enunciation and storytelling lyrics. The narrative structure helps learners follow a story in English."),
        IconicSong("Hotel California", "Eagles", "A mysterious narrative song with rich imagery and metaphors. Perfect for intermediate learners exploring figurative language."),
        IconicSong("Hey Jude", "The Beatles", "A stadium sing-along classic with a memorable 'na-na-na' chorus. The verses teach encouragement phrases and emotional vocabulary."),
        IconicSong("Shape of You", "Ed Sheeran", "A modern pop hit with contemporary slang and romantic vocabulary. Clear pronunciation and repetitive structure aid memorization."),
        IconicSong("Yesterday", "The Beatles", "One of the most covered songs ever. Simple past tense usage and melancholic vocabulary make it ideal for beginners."),
        IconicSong("Thriller", "Michael Jackson", "The best-selling album's title track with horror vocabulary and Vincent Price's spoken interlude for listening practice."),
        IconicSong("Someone Like You", "Adele", "A powerful ballad with emotional vocabulary about heartbreak. Adele's clear British pronunciation is excellent for listening."),
        IconicSong("Wonderwall", "Oasis", "A 90s Britpop anthem with poetic lyrics about hope and salvation. Great for understanding British English expressions."),
    ],
    "fr": [
        IconicSong("La Vie en rose", "Édith Piaf", "The ultimate French chanson — romantic imagery, clear diction, and vocabulary about love and happiness. A cultural touchstone."),
        IconicSong("Ne me quitte pas", "Jacques Brel", "A desperately beautiful plea to a departing lover. Imperative mood practice and emotional vocabulary in poetic Belgian French."),
        IconicSong("Alors on danse", "Stromae", "Modern Belgian-French electropop about life's pressures. Contemporary vocabulary, clear pronunciation, ironic social commentary."),
        IconicSong("Je t'aime... moi non plus", "Serge Gainsbourg", "A controversial 1969 duet that's a cultural landmark. Intimate vocabulary and provocative lyrics."),
        IconicSong("Les Champs-Élysées", "Joe Dassin", "A cheerful stroll down Paris's famous avenue. Simple vocabulary about city life, perfect for beginners."),
        IconicSong("Comme d'habitude", "Claude François", "The French original of 'My Way'. Daily routine vocabulary and the original lyrics Sinatra made famous."),
        IconicSong("Papaoutai", "Stromae", "A poignant song about absent fathers. The title is phonetic French ('Papa où t'es?') — great for pronunciation."),
        IconicSong("La Bohème", "Charles Aznavour", "Nostalgic memories of artistic youth in Montmartre. Past tense narration and artistic vocabulary."),
        IconicSong("Non, je ne regrette rien", "Édith Piaf", "Piaf's defiant anthem of no regrets. Negation practice and empowering vocabulary."),
        IconicSong("Formidable", "Stromae", "A drunk man's public breakdown — raw emotion, slurred speech for advanced listening, Belgian French humor."),
    ],
    "de": [
        IconicSong("99 Luftballons", "Nena", "Cold War anti-war anthem about balloons triggering military panic. Clear 80s German, political vocabulary, cultural history."),
        IconicSong("Du hast", "Rammstein", "Industrial metal with a clever play on 'du hast' (you have) vs 'du hasst' (you hate). Repetitive, memorable, pronunciation practice."),
        IconicSong("Atemlos durch die Nacht", "Helene Fischer", "Germany's biggest modern pop hit. Party vocabulary, fast-paced lyrics, Schlager culture."),
        IconicSong("Major Tom", "Peter Schilling", "German response to Bowie's Space Oddity. Space vocabulary, storytelling, 80s synth-pop."),
        IconicSong("Ohne dich", "Rammstein", "A tender ballad from the metal giants. Simple vocabulary about loneliness and dependence."),
        IconicSong("Ein Kompliment", "Sportfreunde Stiller", "A sweet indie-rock love song. Compliment vocabulary and romantic expressions."),
        IconicSong("Irgendwie, Irgendwo, Irgendwann", "Nena", "80s synth-pop about hope and connection. Indefinite pronouns practice."),
        IconicSong("Durch den Monsun", "Tokio Hotel", "2000s teen rock phenomenon. Weather vocabulary, emotional teenage lyrics."),
        IconicSong("Verdammt, ich lieb dich", "Matthias Reim", "A Schlager power ballad about reluctant love. Swearing vocabulary, emotional expressions."),
        IconicSong("Hier kommt Alex", "Die Toten Hosen", "Punk rock based on A Clockwork Orange. Narrative structure, rebellious vocabulary."),
    ],
    "es": [
        IconicSong("Despacito", "Luis Fonsi", "The most-viewed Spanish video ever. Romantic vocabulary, Puerto Rican pronunciation, reggaeton rhythm."),
        IconicSong("La Bamba", "Ritchie Valens", "Mexican folk turned rock classic. Simple lyrics, traditional vocabulary, cultural celebration."),
        IconicSong("Bailando", "Enrique Iglesias", "Dance-pop anthem with Cuban reggaeton influence. Body movement vocabulary, party phrases."),
        IconicSong("Me gustas tú", "Manu Chao", "Perfect for beginners — lists things using 'me gusta'. Simple structure, travel vocabulary."),
        IconicSong("Clandestino", "Manu Chao", "Powerful migration anthem. Advanced vocabulary about borders, identity, searching for belonging."),
        IconicSong("La Camisa Negra", "Juanes", "Colombian rock about heartbreak. Color vocabulary, clear pronunciation, memorable chorus."),
        IconicSong("Macarena", "Los del Río", "The 90s dance phenomenon. Though silly, it's memorable and uses imperatives."),
        IconicSong("Vivir Mi Vida", "Marc Anthony", "Uplifting salsa about embracing life. Positive vocabulary, future tense, Latin philosophy."),
        IconicSong("Livin' la Vida Loca", "Ricky Martin", "Latin pop breakthrough. Party lifestyle vocabulary, Spanglish elements."),
        IconicSong("Ojalá", "Silvio Rodríguez", "Cuban nueva trova poetry. Subjunctive mood ('ojalá que') practice, poetic imagery."),
    ],
    "pt": [
        IconicSong("Garota de Ipanema", "Tom Jobim", "The world's most famous bossa nova. Brazilian beach culture, poetic Portuguese, jazz harmony."),
        IconicSong("Aquarela", "Toquinho", "A children's song loved by adults. Colors, imagination vocabulary, clear Brazilian pronunciation."),
        IconicSong("Chega de Saudade", "João Gilberto", "The song that started bossa nova. 'Saudade' — the untranslatable Portuguese longing."),
        IconicSong("Evidências", "Chitãozinho & Xororó", "Brazil's karaoke king — every Brazilian knows it. Sertanejo style, dramatic love vocabulary."),
        IconicSong("Pais e Filhos", "Legião Urbana", "Brazilian rock about family relationships. Generation gap vocabulary, emotional Portuguese."),
        IconicSong("Ai se eu te pego", "Michel Teló", "Viral Brazilian hit. Simple, repetitive lyrics perfect for beginners, dance culture."),
        IconicSong("Tarde em Itapuã", "Toquinho & Vinicius", "Sunset at a Salvador beach. Romantic imagery, place vocabulary, poetic language."),
        IconicSong("País Tropical", "Jorge Ben Jor", "Celebration of Brazil. National identity vocabulary, samba-funk rhythm."),
        IconicSong("Construção", "Chico Buarque", "Poetic masterpiece using proparoxytone words. Advanced vocabulary, social commentary."),
        IconicSong("Mas que Nada", "Sérgio Mendes", "Brazilian jazz-pop crossover. Afro-Brazilian cultural vocabulary, upbeat rhythm."),
    ],
    "ru": [
        IconicSong("Группа крови", "Кино", "Viktor Tsoi's rock anthem about fate and struggle. Essential vocabulary, cultural icon status."),
        IconicSong("Звезда по имени Солнце", "Кино", "Poetic rock about inner fire. Space metaphors, generational anthem of the 80s."),
        IconicSong("Надежда", "Анна Герман", "A beautiful ballad about hope by Polish-Soviet star Anna German. Emotional vocabulary, clear pronunciation."),
        IconicSong("Миллион алых роз", "Алла Пугачёва", "Soviet pop legend's signature song. Romantic gesture vocabulary, color words, storytelling."),
        IconicSong("Перемен", "Кино", "The perestroika anthem demanding change. Political vocabulary, historical significance."),
        IconicSong("Москва", "Монгол Шуудан", "Rock song about the capital. City vocabulary, strong pronunciation for practice."),
        IconicSong("Белые розы", "Ласковый май", "90s teen pop sensation. Simple romantic vocabulary, nostalgic for many Russians."),
        IconicSong("В траве сидел кузнечик", "Из мультфильма", "Children's song about a grasshopper. Animal vocabulary, perfect for absolute beginners."),
        IconicSong("Крылья", "Наутилус Помпилиус", "Philosophical rock about freedom. Wing/flight metaphors, existential vocabulary."),
        IconicSong("Ветер с моря дул", "Натали", "Catchy 90s pop hit. Weather vocabulary, simple structure, very memorable."),
    ],
    "pl": [
        IconicSong("Dziwny jest ten świat", "Czesław Niemen", "Poland's 'Imagine' — a plea for peace and understanding. Simple vocabulary, deep meaning."),
        IconicSong("Autobiografia", "Perfect", "80s rock about lost youth. Past tense practice, nostalgia vocabulary."),
        IconicSong("Jolka, Jolka pamiętasz", "Budka Suflera", "Love letter to a lost love named Jolka. Memory vocabulary, emotional Polish."),
        IconicSong("Małgośka", "Czerwone Gitary", "60s Polish beat about a girl. Simple vocabulary, clear pronunciation."),
        IconicSong("Zegarmistrz Światła", "Tadeusz Woźniak", "Philosophical rock ballad about a watchmaker of light. Poetic Polish vocabulary, metaphorical storytelling."),
        IconicSong("Wehikuł czasu", "Dżem", "Blues-rock journey through time. Time travel vocabulary, philosophical lyrics."),
        IconicSong("Tacy sami", "Obywatel G.C.", "80s rock about conformity vs individuality. Social vocabulary, adjective practice."),
        IconicSong("Kocham wolność", "Chłopcy z Placu Broni", "Freedom anthem from communist era. Liberty vocabulary, historical context."),
        IconicSong("Sen o Warszawie", "Czesław Niemen", "Dream about Warsaw. City vocabulary, lyrical imagery."),
        IconicSong("Przez twe oczy zielone", "Akcent", "Modern disco polo hit. Color vocabulary, romantic expressions, popular culture."),
    ],
    "zh": [
        IconicSong("月亮代表我的心", "邓丽君", "Teresa Teng's classic about eternal love. Simple vocabulary, slow pace perfect for beginners."),
        IconicSong("朋友", "周华健", "Friendship anthem sung at gatherings. Social vocabulary, emotional bonding phrases."),
        IconicSong("童年", "罗大佑", "Nostalgic memories of childhood. School vocabulary, past tense, simple narrative."),
        IconicSong("对不起我爱你", "周杰伦", "Jay Chou's apologetic love song. Relationship vocabulary, modern Mandarin."),
        IconicSong("青花瓷", "周杰伦", "Poetic song about porcelain and lost love. Cultural vocabulary, beautiful imagery."),
        IconicSong("甜蜜蜜", "邓丽君", "Sweet honey love song. Food metaphors, endearment vocabulary, classic pronunciation."),
        IconicSong("小苹果", "筷子兄弟", "Viral internet song. Very simple vocabulary, catchy for memorization."),
        IconicSong("千里之外", "周杰伦", "Distance and longing across miles. Geography vocabulary, emotional Chinese."),
        IconicSong("最炫民族风", "凤凰传奇", "Folk-pop fusion hit. Traditional and modern vocabulary blend."),
        IconicSong("我的中国心", "张明敏", "Patriotic song about Chinese identity. Country vocabulary, national pride expressions."),
    ],
    "hi": [
        IconicSong("Chaiyya Chaiyya", "A.R. Rahman", "Filmed atop a moving train — one of Bollywood's most iconic scenes. Sufi-inspired vocabulary."),
        IconicSong("Kal Ho Naa Ho", "Sonu Nigam", "Living in the moment philosophy. Time vocabulary, carpe diem expressions."),
        IconicSong("Tujhe Dekha To", "Kumar Sanu", "DDLJ's eternal love theme. Romantic vocabulary, essential Bollywood reference."),
        IconicSong("Dil To Pagal Hai", "Lata Mangeshkar", "Heart-as-fool metaphor. Body part vocabulary, love expressions."),
        IconicSong("Lag Ja Gale", "Lata Mangeshkar", "Timeless embrace song. Physical affection vocabulary, old Hindi elegance."),
        IconicSong("Tum Hi Ho", "Arijit Singh", "Modern romantic blockbuster. Contemporary Hindi, devotional love expressions."),
        IconicSong("Kajra Re", "Shankar-Ehsaan-Loy", "Playful song about kohl-lined eyes. Beauty vocabulary, mischievous Hindi."),
        IconicSong("Rang De Basanti", "A.R. Rahman", "Patriotic youth anthem. Color vocabulary, revolutionary spirit."),
        IconicSong("Jai Ho", "A.R. Rahman", "Oscar-winning anthem of victory. Celebration vocabulary, global recognition."),
        IconicSong("Kabhi Khushi Kabhie Gham", "Lata Mangeshkar", "Joy and sorrow in family. Emotion vocabulary, traditional values."),
    ],
    "ar": [
        IconicSong("Enta Omri", "Umm Kulthum", "The Arab world's most famous song — over an hour long. Classical Arabic poetry and passion."),
        IconicSong("Ahwak", "Abdel Halim Hafez", "Golden age Egyptian romance. Classic MSA-influenced lyrics, emotional vocabulary."),
        IconicSong("Habibi Ya Nour El Ain", "Amr Diab", "Modern Egyptian pop king. Endearment vocabulary, clear contemporary Arabic."),
        IconicSong("Ana Baashaq El Bahr", "Fairuz", "Lebanese icon sings about loving the sea. Nature vocabulary, poetic Levantine."),
        IconicSong("3 Daqat", "Abu", "Contemporary romance hit. Modern expressions, Egyptian dialect accessible to learners."),
        IconicSong("Nassam Alayna El Hawa", "Fairuz", "Breeze of love poetry. Weather metaphors, classical Arabic beauty."),
        IconicSong("Batwanes Beek", "Warda", "Sensual Arabic love song. Intimacy vocabulary, North African flair."),
        IconicSong("Ya Tabtab", "Nancy Ajram", "Lebanese pop princess. Modern youth vocabulary, contemporary culture."),
        IconicSong("Tamally Maak", "Amr Diab", "Always with you romanticism. Relationship vocabulary, catchy modern Arabic."),
        IconicSong("Wehyat Oyounek", "Abdel Halim Hafez", "Swearing by your eyes — Arabic romantic tradition. Oath expressions, poetic language."),
    ],
}


def pick_iconic_song(lang: str) -> IconicSong:
    import random

    key = (lang or "en").lower()
    songs = ICONIC_SONGS.get(key) or ICONIC_SONGS["en"]
    return random.choice(songs)
