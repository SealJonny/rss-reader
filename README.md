# rss-reader

## Must-Haves

- **Allgemein**
  - Kategorisieren der News mithilfe von KI (basierend auf festen Kategorien)
  - Auslesen von XML-Dateien und parsen in Typescript Interfaces
  - 

- **Verwaltungsmodus**
  - Hinzufügen und Verwalten von neuen RSS-Feeds (Url's werden lokal gespeichert)
  - Erstellen, Löschen, und Editieren Favoriten
  - Ki-Integration:
    - RSS-Feeds können per Ki-Suche hinzugefügt werden

- **Anwendungsmodus**
  -
## Nice-To-Haves

- Speicherung der RSS-News und der Kategorien in einer SQLite-DB 
- Nextcloud Integration (Synchronisation der DB)

## Funktion
- Start des Programms
  - Asynchrones cachen der gespeicherten RSS-Feeds
  - Kategorisieren mit Ki

- Menü
  - Administration
  - Feeds
  - Kategorien 