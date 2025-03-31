# Benutzerhandbuch für den RSS-Feed-Reader

Willkommen zum Benutzerhandbuch für den RSS-Feed-Reader! Dieses Dokument erklärt die Nutzung des Programms und hilft Ihnen, die Funktionen optimal einzusetzen.

---

## Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Installation und Setup](#installation-und-setup)
3. [Programmstart und Startbildschirm](#programmstart-und-startbildschirm)
4. [Navigationskonzept und Hilfe-Box](#navigationskonzept-und-hilfe-box)
5. [Hauptfunktionen](#hauptfunktionen)
   - [Hauptmenü](#hauptmenü)
   - [RSS-Feed-Anzeige](#rss-feed-anzeige)
   - [Feed-Inhalte navigieren](#feed-inhalte-navigieren)
   - [Artikel als Favorit markieren](#artikel-als-favorit-markieren)
   - [Artikelzusammenfassung anzeigen](#artikelzusammenfassung-anzeigen)
   - [Artikellinks im Browser öffnen](#artikellinks-im-browser-öffnen)
6. [Verwaltungsfunktionen](#verwaltungsfunktionen)
   - [RSS-Feeds verwalten](#rss-feeds-verwalten)
   - [Kategorien verwalten](#kategorien-verwalten)
   - [Feeds synchronisieren](#feeds-synchronisieren)
7. [Tastenkombinationen](#tastenkombinationen)
8. [Fehlerbehebung](#fehlerbehebung)

---

## Einführung

Der RSS-Feed-Reader ist ein Terminal-basiertes Werkzeug zur Verwaltung und Anzeige von RSS-Feeds. Die Anwendung ermöglicht es Ihnen, Nachrichten aus verschiedenen Quellen zu lesen, zu kategorisieren und zu organisieren. Dieses Handbuch richtet sich an technisch versierte Nutzer mit Grundkenntnissen in der Bedienung von Terminal-Anwendungen.

---

## Installation und Setup

### Voraussetzungen

- Node.js (Version 14 oder höher)
- npm (kommt mit Node.js)
- OpenAI API-Schlüssel für die KI-gestützte Kategorisierung

### Installation

1. Klonen Sie das Repository oder entpacken Sie die Anwendung in einen Ordner Ihrer Wahl:
   ```bash
   git clone https://github.com/username/rss-reader.git
   cd rss-reader
   ```

2. Installieren Sie alle notwendigen Abhängigkeiten:
   ```bash
   npm install
   ```

3. Erstellen Sie eine `.env`-Datei im Hauptverzeichnis der Anwendung und fügen Sie Ihren OpenAI API-Schlüssel hinzu:
   ```
   OPENAI_API_KEY=Ihr_API_Schlüssel_hier
   ```

4. Kompilieren Sie die Anwendung:
   ```bash
   npm run build
   ```

5. Starten Sie die Anwendung:
   ```bash
   npm start
   ```

---

## Programmstart und Startbildschirm

Beim ersten Start der Anwendung wird eine ASCII-Animation angezeigt, die den Text "RSS READER" einblendet. Während dieser Animation wird die Datenbank initialisiert und die ersten Feeds geladen.

Die Animation kann durch Drücken der `Enter`-Taste übersprungen werden, sobald die Datenbank-Initialisierung abgeschlossen ist.

---

## Navigationskonzept und Hilfe-Box

Der RSS-Feed-Reader verwendet ein kontextsensitives Hilfesystem, das am unteren Bildschirmrand angezeigt wird. Diese Hilfe-Box zeigt immer die aktuell verfügbaren Tastenkombinationen für den jeweiligen Bildschirm an.

Beispiel für die Hilfe-Box im Hauptmenü:
```
[enter] Auswählen  [↑/↓] Navigieren  [ctrl+c] Verlassen
```

Beispiel für die Hilfe-Box in der Feed-Ansicht:
```
[o] Link Öffnen [f] Favorisieren [s] Zusammenfassung [↑/↓] Navigieren [q] Zurück
```

Die Navigation erfolgt hauptsächlich über die Tastatur mit den Pfeiltasten für die Bewegung und Eingabetaste zur Auswahl. Die Anwendung ist in verschiedene Ansichten unterteilt, zwischen denen Sie wechseln können.

---

## Hauptfunktionen

### Hauptmenü

Das Hauptmenü ist der zentrale Ausgangspunkt zur Navigation durch die Anwendung. Es ist in folgende Bereiche unterteilt:

- **Feeds**
  - **Allgemein (1)**: Zeigt alle verfügbaren Nachrichten der letzten 24 Stunden an
  - **Kategorien (2)**: Öffnet ein Untermenü mit benutzerdefinierten Kategorien
  - **Favoriten (3)**: Zeigt alle von Ihnen favorisierten Nachrichten an

- **Verwaltung**
  - **RSS-Feeds (4)**: Öffnet die Verwaltung für RSS-Feed-URLs
  - **Kategorien (5)**: Öffnet die Verwaltung für Kategorien

- **Werkzeuge**
  - **Synchronisieren (6)**: Startet die Synchronisation aller Feeds

Sie können die entsprechenden Ziffern als Tastenkürzel verwenden oder mit den Pfeiltasten navigieren und mit `Enter` auswählen.

![Hauptmenü](/images/main-menu.png)

### RSS-Feed-Anzeige

Die Feed-Ansicht zeigt die Nachrichtenartikel aus der ausgewählten Kategorie oder dem ausgewählten Bereich an. Jeder Artikel wird mit folgenden Informationen dargestellt:

- Titel (hervorgehoben)
- Veröffentlichungsdatum
- Beschreibung
- Zugehörige Kategorien
- Link zur Quelle
- Quellenname

Am oberen Rand sehen Sie eine Navigationsleiste mit der aktuellen Position im Feed (z.B. "1/25 - Allgemein").

![RSS-Feed-Ansicht](/images/rss-feed-view.png)

### Feed-Inhalte navigieren

In der Feed-Ansicht können Sie:

- Mit `↑` oder `k`: Zum vorherigen Artikel wechseln
- Mit `↓` oder `j`: Zum nächsten Artikel wechseln
- Mit `q`: Die Feed-Ansicht verlassen und zum vorherigen Bildschirm zurückkehren

### Artikel als Favorit markieren

Sie können jeden Artikel als Favorit markieren, um ihn später leichter wiederzufinden:

1. Navigieren Sie zum gewünschten Artikel in der Feed-Ansicht
2. Drücken Sie `f`, um den Artikel als Favorit zu markieren
3. Ein Stern (✻) erscheint neben dem Artikeltitel, um anzuzeigen, dass der Artikel nun als Favorit markiert ist
4. Um die Markierung zu entfernen, drücken Sie erneut `f`

Favorisierte Artikel können über die "Favoriten"-Option im Hauptmenü aufgerufen werden.

### Artikelzusammenfassung anzeigen

Für lange Artikel können Sie eine KI-generierte Zusammenfassung anzeigen lassen:

1. Navigieren Sie zum gewünschten Artikel in der Feed-Ansicht
2. Drücken Sie `s`, um die Zusammenfassung anzuzeigen
3. Die Zusammenfassung wird in einem Popup-Fenster angezeigt
4. Drücken Sie eine beliebige Taste, um zur Feed-Ansicht zurückzukehren

### Artikellinks im Browser öffnen

Um den vollständigen Artikel in Ihrem Standard-Webbrowser zu öffnen:

1. Navigieren Sie zum gewünschten Artikel in der Feed-Ansicht
2. Drücken Sie `o`, um den Link im Browser zu öffnen
3. Der Artikel wird in Ihrem Standard-Webbrowser geöffnet

---

## Verwaltungsfunktionen

### RSS-Feeds verwalten

Im Bereich "RSS-Feeds verwalten" können Sie:

- Neue RSS-Feed-URLs hinzufügen:
  1. Drücken Sie `a`, um einen neuen Feed hinzuzufügen
  2. Geben Sie den Namen und die URL des Feeds ein
  3. Bestätigen Sie mit `Enter`

- Bestehende Feeds bearbeiten:
  1. Wählen Sie den zu bearbeitenden Feed aus
  2. Drücken Sie `e`, um den Feed zu bearbeiten
  3. Ändern Sie die gewünschten Felder
  4. Bestätigen Sie mit `Enter`

- Feeds löschen:
  1. Wählen Sie den zu löschenden Feed aus
  2. Drücken Sie `d`, um den Feed zu löschen
  3. Bestätigen Sie den Löschvorgang

- ChatGPT für Feed-Suche nutzen:
  1. Drücken Sie `c`, um die ChatGPT-Suche zu öffnen
  2. Geben Sie ein Thema oder Stichwort ein
  3. Die KI sucht passende RSS-Feeds für Sie

### Kategorien verwalten

Im Bereich "Kategorien verwalten" können Sie:

- Neue Kategorien erstellen:
  1. Drücken Sie `a`, um eine neue Kategorie hinzuzufügen
  2. Geben Sie den Namen der Kategorie ein
  3. Geben Sie eine Beschreibung für die Kategorie ein. Hier können Sie Ihre Kategorien auch spezifizieren. Zum Beispiel: Wenn Ihre Kategorie "Sport" heißt, Sie aber nur Nachrichten über die Fußball-Bundesliga haben möchten, können Sie das in der Beschreibung spezifizieren
  4. Bestätigen Sie mit `Enter`

- Bestehende Kategorien bearbeiten:
  1. Wählen Sie die zu bearbeitende Kategorie aus
  2. Drücken Sie `e`, um die Kategorie zu bearbeiten
  3. Ändern Sie den Namen oder die Beschreibung der Kategorie
  4. Bestätigen Sie mit `Enter`

- Kategorien löschen:
  1. Wählen Sie die zu löschende Kategorie aus
  2. Drücken Sie `d`, um die Kategorie zu löschen
  3. Bestätigen Sie den Löschvorgang

Wichtig! Wenn Sie Änderungen an den Kategorien vornehmen, müssen Sie einmal mit `r` die Kategorien neu laden. Dadurch werden die Nachrichten noch einmal neu kategorisiert,

### Feeds synchronisieren

Die Synchronisationsfunktion lädt die neuesten Inhalte aller RSS-Feeds herunter und kategorisiert neue Artikel automatisch:

1. Wählen Sie "Synchronisieren" im Hauptmenü
2. Die Anwendung zeigt eine Animation während des Synchronisationsvorgangs
3. Nach Abschluss der Synchronisation erhalten Sie eine Benachrichtigung
4. Neue Artikel sind nun in den entsprechenden Kategorien verfügbar

Hinweis: Die Kategorisierung erfolgt durch KI und benötigt einen gültigen OpenAI API-Schlüssel.

---

## Tastenkombinationen

### Allgemeine Tastenkombinationen
- `Ctrl+C`: Programm beenden (zweimal drücken zur Bestätigung)
- `Enter`: Auswahl bestätigen
- `↑/↓`: Navigation in Listen

### Hauptmenü
- `1` bis `6`: Direktzugriff auf die verschiedenen Menüoptionen

### Feed-Ansicht
- `↑` oder `k`: Vorheriger Artikel
- `↓` oder `j`: Nächster Artikel
- `o`: Link im Browser öffnen
- `f`: Als Favorit markieren/Favorit entfernen
- `s`: Zusammenfassung anzeigen
- `q`: Zurück zum vorherigen Bildschirm

### Verwaltungsansichten
- `a`: Hinzufügen
- `e`: Bearbeiten
- `d`: Löschen
- `c`: ChatGPT-Suche (nur bei RSS-Feeds)
- `q`: Zurück zum Hauptmenü

---

## Fehlerbehebung

### Häufige Probleme und Lösungen

- **Problem**: Das Programm startet nicht.
  - **Lösung**: Überprüfen Sie, ob Node.js korrekt installiert ist und alle Abhängigkeiten mit `npm install` installiert wurden.

- **Problem**: Die Synchronisation schlägt fehl.
  - **Lösung**:
    1. Überprüfen Sie Ihre Internetverbindung
    2. Stellen Sie sicher, dass der OpenAI API-Schlüssel in der `.env`-Datei korrekt ist
    3. Überprüfen Sie, ob die RSS-Feed-URLs gültig sind

- **Problem**: Ein RSS-Feed wird nicht korrekt angezeigt.
  - **Lösung**:
    1. Entfernen Sie den Feed und fügen Sie ihn erneut hinzu
    2. Überprüfen Sie, ob die Feed-URL noch aktuell ist
    3. Synchronisieren Sie die Feeds erneut

- **Problem**: Die KI-Kategorisierung funktioniert nicht.
  - **Lösung**:
    1. Überprüfen Sie den OpenAI API-Schlüssel
    2. Stellen Sie sicher, dass Ihr API-Konto über ausreichendes Guthaben verfügt

### Programmabsturz

Bei einem Absturz des Programms:
1. Beenden Sie alle laufenden Prozesse mit `Ctrl+C`
2. Starten Sie die Anwendung mit `npm start` neu
3. Die Anwendung sollte den letzten Stand der Datenbank wiederherstellen

---

Vielen Dank, dass Sie den RSS-Feed-Reader verwenden! Bei weiteren Fragen oder Problemen wenden Sie sich bitte an den Entwickler.
