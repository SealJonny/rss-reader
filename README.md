# rss-reader

## Must-Haves

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

## Nice-To-Haves

- Speicherung der RSS-News und der Kategorien in einer SQLite-DB 
- Nextcloud Integration (Synchronisation der DB)