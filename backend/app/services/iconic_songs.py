from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class IconicSong:
    title: str
    artist: str
    fallback_reason: str


# Small curated set per learning language (can be expanded anytime).
ICONIC_SONGS: Dict[str, List[IconicSong]] = {
    "en": [
        IconicSong("Bohemian Rhapsody", "Queen", "A genre-bending anthem with iconic vocals and cultural staying power."),
        IconicSong("Imagine", "John Lennon", "A timeless peace song known worldwide and easy to sing along to."),
        IconicSong("Billie Jean", "Michael Jackson", "A defining pop track with instantly recognizable groove and lyrics."),
        IconicSong("Smells Like Teen Spirit", "Nirvana", "A defining grunge era song that shaped modern rock culture."),
        IconicSong("Hey Jude", "The Beatles", "A stadium sing-along classic with memorable chorus and simple phrases."),
    ],
    "fr": [
        IconicSong("La vie en rose", "Édith Piaf", "A classic chanson loved for its romantic imagery and clear storytelling."),
        IconicSong("Je te promets", "Johnny Hallyday", "A major French rock ballad known across generations."),
        IconicSong("Alors on danse", "Stromae", "A modern French-language hit with catchy rhythm and relatable theme."),
        IconicSong("Ne me quitte pas", "Jacques Brel", "A legendary ballad praised for its emotional delivery and poetry."),
        IconicSong("Désenchantée", "Mylène Farmer", "A pop classic that became a cultural reference in French music."),
    ],
    "de": [
        IconicSong("99 Luftballons", "Nena", "A German pop classic with clear diction and famous anti-war narrative."),
        IconicSong("Du hast", "Rammstein", "A globally known German rock song with memorable repetitive lines."),
        IconicSong("Major Tom (Völlig losgelöst)", "Peter Schilling", "An iconic German synth-pop track with an unforgettable hook."),
        IconicSong("Ein Kompliment", "Sportfreunde Stiller", "A beloved German indie pop song often sung at gatherings."),
        IconicSong("Atemlos durch die Nacht", "Helene Fischer", "A modern German party staple with simple, repeated phrases."),
    ],
    "pl": [
        IconicSong("Dziwny jest ten świat", "Czesław Niemen", "A legendary Polish song often compared to major protest classics."),
        IconicSong("Przez Twe Oczy Zielone", "Akcent", "A widely known modern Polish hit with simple, catchy lyrics."),
        IconicSong("Autobiografia", "Perfect", "A Polish rock anthem strongly associated with an era and its youth culture."),
        IconicSong("Sen o Warszawie", "Czesław Niemen", "A cultural song connected with Warsaw and often sung by crowds."),
        IconicSong("Jolka, Jolka pamiętasz", "Budka Suflera", "A famous Polish ballad known for storytelling and emotion."),
    ],
    "ru": [
        IconicSong("Группа крови", "Кино", "An iconic rock song strongly associated with a generation and its themes."),
        IconicSong("Звезда по имени Солнце", "Кино", "A cultural reference in Russian rock with simple, memorable phrases."),
        IconicSong("Нежность", "Майя Кристалинская", "A classic romantic song known for its poetic language."),
        IconicSong("Катюша", "Народная", "A well-known folk/war-era song recognized by many generations."),
        IconicSong("Перемен", "Кино", "A legendary anthem representing social change and cultural memory."),
    ],
    "pt": [
        IconicSong("Garota de Ipanema", "Tom Jobim", "A bossa nova classic known worldwide and often used in language learning."),
        IconicSong("Aquarela", "Toquinho", "A beloved song with clear imagery and accessible vocabulary."),
        IconicSong("Chega de Saudade", "João Gilberto", "A foundational bossa nova song with deep cultural impact."),
        IconicSong("Evidências", "Chitãozinho & Xororó", "A huge sing-along staple in Brazil with memorable lines."),
        IconicSong("Pais e Filhos", "Legião Urbana", "A famous Brazilian rock song with strong cultural resonance."),
    ],
    "es": [
        IconicSong("Clandestino", "Manu Chao", "A global hit that blends Spanish lyrics with catchy melodies about migration."),
        IconicSong("La Bamba", "Ritchie Valens", "A rock adaptation of a Mexican folk song, iconic worldwide."),
        IconicSong("Despacito", "Luis Fonsi", "A record-breaking Latin pop song with simple, repetitive lyrics."),
        IconicSong("Bailando", "Enrique Iglesias", "A massively popular Spanish dance song with clear pronunciation."),
        IconicSong("Ojalá", "Silvio Rodríguez", "A beloved Cuban nueva trova song with poetic Spanish lyrics."),
        IconicSong("Me gustas tú", "Manu Chao", "A catchy song perfect for learning common Spanish phrases."),
        IconicSong("La Camisa Negra", "Juanes", "A Colombian rock hit with memorable chorus and clear diction."),
    ],
    "zh": [
        IconicSong("月亮代表我的心", "邓丽君", "A classic Mandarin love song known across Chinese-speaking world."),
        IconicSong("朋友", "周华健", "A friendship anthem often sung at gatherings in Chinese culture."),
        IconicSong("童年", "罗大佑", "A nostalgic song about childhood with simple, clear lyrics."),
        IconicSong("海阔天空", "Beyond", "A Cantonese rock anthem about dreams and perseverance."),
        IconicSong("小苹果", "筷子兄弟", "A viral modern Chinese pop song with catchy, repetitive phrases."),
    ],
    "hi": [
        IconicSong("Chaiyya Chaiyya", "A.R. Rahman", "An iconic Bollywood song known for its energy and memorable hook."),
        IconicSong("Kal Ho Naa Ho", "Sonu Nigam", "A beloved Hindi song about living in the moment."),
        IconicSong("Tujhe Dekha To", "Kumar Sanu", "A classic romantic Bollywood song known by generations."),
        IconicSong("Kajra Re", "Shankar-Ehsaan-Loy", "A fun Bollywood dance number with catchy lyrics."),
        IconicSong("Lag Ja Gale", "Lata Mangeshkar", "A timeless Hindi classic with beautiful, clear pronunciation."),
    ],
    "ar": [
        IconicSong("Ahwak", "Abdel Halim Hafez", "A legendary Arabic love song from Egyptian golden age of music."),
        IconicSong("Ana Baashaq El Bahr", "Fairuz", "A beloved Lebanese song with poetic Arabic lyrics."),
        IconicSong("Habibi Ya Nour El Ain", "Amr Diab", "A modern Arabic pop classic known across the Arab world."),
        IconicSong("Enta Omri", "Umm Kulthum", "One of the most famous Arabic songs ever recorded."),
        IconicSong("3 Daqat", "Abu", "A contemporary Arabic hit with romantic, singable lyrics."),
    ],
}


def pick_iconic_song(lang: str) -> IconicSong:
    import random

    key = (lang or "en").lower()
    songs = ICONIC_SONGS.get(key) or ICONIC_SONGS["en"]
    return random.choice(songs)


