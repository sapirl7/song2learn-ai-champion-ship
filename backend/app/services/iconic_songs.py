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
}


def pick_iconic_song(lang: str) -> IconicSong:
    import random

    key = (lang or "en").lower()
    songs = ICONIC_SONGS.get(key) or ICONIC_SONGS["en"]
    return random.choice(songs)


