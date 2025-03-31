# RSS-Feed-Reader

Ein Terminal-basierter RSS-Feed-Reader mit KI-gestützter Kategorisierung, der es ermöglicht, Nachrichten aus verschiedenen Quellen zu lesen, zu organisieren und zu verwalten.

![RSS-Reader Screenshot (Platzhalter)](/images/main-menu.png)

## Funktionen

### Hauptfunktionen
- Lesen und Verwalten von RSS-Feeds in einer übersichtlichen Terminal-Oberfläche
- KI-gestützte Kategorisierung von Nachrichtenartikeln
- Speicherung von Favoriten für schnellen Zugriff auf wichtige Nachrichten
- Zusammenfassungen von Artikeln mittels KI
- Öffnen von Artikeln im Standard-Webbrowser

### Verwaltungsfunktionen
- Hinzufügen und Verwalten von RSS-Feed-URLs
- KI-gestützte Suche nach passenden RSS-Feeds zu bestimmten Themen
- Erstellen, Bearbeiten und Löschen von Kategorien
- Einfache Synchronisation aller Feeds

## Installation

### Voraussetzungen
- Node.js (Version 14 oder höher)
- npm (wird mit Node.js installiert)
- OpenAI API-Schlüssel für die KI-Funktionen

### Installationsschritte

1. Repository klonen:
   ```bash
   git clone https://github.com/username/rss-reader.git
   cd rss-reader
   ```

2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```

3. `.env`-Datei erstellen und OpenAI API-Schlüssel hinzufügen:
   ```
   OPENAI_API_KEY=Ihr_API_Schlüssel
   ```

4. Anwendung kompilieren:
   ```bash
   npm run build
   ```

5. Anwendung starten:
   ```bash
   npm start
   ```

## Verwendung

Eine detaillierte Anleitung zur Verwendung des RSS-Feed-Readers finden Sie in der [Benutzerdokumentation](usage.md).

Die wichtigsten Funktionen im Überblick:
- Navigation durch Feeds mit Pfeiltasten
- Artikel als Favorit markieren mit `f`
- Links im Browser öffnen mit `o`
- Zusammenfassungen anzeigen mit `s`
- Kontext-sensitive Hilfe am unteren Bildschirmrand

## Technische Details

Der RSS-Feed-Reader wurde mit folgenden Technologien entwickelt:
- TypeScript
- SQLite für die Datenbankfunktionalität
- OpenAI API für die KI-gestützte Kategorisierung und Zusammenfassung
- Blessed für die Terminal-UI

## Projektstruktur

- `src/ai/`: Module für die KI-Integration (Kategorisierung, Zusammenfassung)
- `src/database/`: Datenbankzugriff und -verwaltung
- `src/interfaces/`: TypeScript-Interfaces für Datenstrukturen
- `src/rss/`: RSS-Feed-Parsing und -Verarbeitung
- `src/terminal/ui/`: Terminal-Benutzeroberfläche

## Entwicklungsstatus

### Must-Haves für das Programmierprojekt:
- **Allgemein**
  - Kategorisieren der News mithilfe von KI (basierend auf festen Kategorien)
  - Auslesen von XML-Dateien und parsen in Typescript Interfaces

- **Verwaltungsmodus**
  - Hinzufügen und Verwalten von neuen RSS-Feeds (Url's werden lokal gespeichert)
  - Erstellen, Löschen, und Editieren Favoriten
  - Ki-Integration:
    - RSS-Feeds können per Ki-Suche hinzugefügt werden

- **Anwendungsmodus**
  - Auswahl von allgemeinem und kategorisierten Feeds, Favoriten
    - Feed -> ein "scrollbarer" RSS-Feed, wie z.B. Insta-Reels
  - Navigieren per Pfeiltasten und Hotkeys für weitere Aktionen
  - News können im default Browser per Hotkey geöffnet werden
  - Favorisieren von News (Permanente Speicherung)

### Nice-To-Haves (zusätzlich umgesetzte Features):

- **Erweiterte Terminal-Benutzeroberfläche**
  - Responsive und ansprechende Terminal-UI mit farbiger Darstellung
  - Dynamische Startanimation beim Programmstart
  - Kontextsensitive Hilfe-Box, die je nach aktuellem Bildschirm die verfügbaren Befehle anzeigt
  - Notification-System für Benutzer-Feedback
  - Interaktive Listennavigation mit Kopf- und Unterzeilen

- **KI-Erweiterungen**
  - KI-generierte Zusammenfassungen von Artikeln auf Knopfdruck
  - Intelligente Kategorisierung basierend auf Kategoriebeschreibungen
  - Automatische Zuordnung von Artikeln zu benutzerdefinierten Kategorien

- **Erweiterte Kategorieverwaltung**
  - Erstellen und Verwalten von benutzerdefinierten Kategorien
  - Definition von Kategorien mit individuellen Beschreibungen zur präziseren KI-Kategorisierung
  - Neuladung von Kategorien und Neukategorisierung bestehender Artikel nach Änderungen
  - Filterung von Nachrichten nach frei definierbaren Kategorien

- **Datenbankverwaltung**
  - SQLite-Datenbankintegration für persistente Datenspeicherung
  - Automatische Bereinigung veralteter Nachrichten (> 24 Stunden)
  - Asynchrone Datenbankjobs für Hintergrundoperationen

- **Benutzerinteraktion**
  - Dynamische Bestätigungsdialogfelder
  - Erweiterte Textformatierung für bessere Lesbarkeit in der Terminal-Umgebung
  - Tastenkürzel für schnelle Navigation und Aktionen

- **NPM-Modul more-blessed**
  - Veröffentlichung einer Erweiterung der Library blessed als NPM Modul

## Autor

Entwickelt von [Ivo Jonathan Brauns](https://github.com/NOTOXio) und [Jonathan Fritsch](https://github.com/SealJonny) als Studienprojekt für die Duale Hochschule.

### Kontakt
Ivo Jonathan Brauns
- GitHub: [@NOTOXio](https://github.com/NOTOXio)
- E-Mail: [ivo.jonathan.brauns@gmail.com]

Jonathan Fritsch
- GitHub: [@SealJonny](https://github.com/SealJonny)
- E-Mail: [jon.fri14@gmail.com]
