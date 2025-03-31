# Benutzerhandbuch für den RSS-Feed-Reader

Willkommen zum Benutzerhandbuch für den RSS-Feed-Reader! Dieses Dokument erklärt die grundlegende Nutzung des Programms und hilft Ihnen, die wichtigsten Funktionen zu verstehen.

---

## Inhaltsverzeichnis
1. [Einführung](#einführung)
2. [Installation und Setup](#installation-und-setup)
3. [Hauptfunktionen](#hauptfunktionen)
   - [Startanimation](#startanimation)
   - [Hauptmenü](#hauptmenü)
   - [Synchronisation](#synchronisation)
   - [RSS-Feed-Anzeige](#rss-feed-anzeige)
   - [Kategorien- und Feed-Verwaltung](#kategorien--und-feed-verwaltung)
4. [Tastenkombinationen](#tastenkombinationen)
5. [Fehlerbehebung](#fehlerbehebung)

---

## Einführung
Der RSS-Feed-Reader ist ein leistungsstarkes Tool, um RSS-Feeds zu verwalten, Nachrichten zu kategorisieren und Inhalte effizient zu durchsuchen. Dieses Handbuch richtet sich an technisch versierte Nutzer mit Grundkenntnissen in der Nutzung von Terminal-Anwendungen.

---

## Installation und Setup
1. **Voraussetzungen**:
   - Node.js und npm müssen installiert sein.
   - Ein OpenAI-API-Schlüssel wird benötigt.

2. **Installation**:
   - Klonen Sie das Repository und navigieren Sie in das Projektverzeichnis.
   - Führen Sie den folgenden Befehl aus, um die Abhängigkeiten zu installieren:
     ```bash
     npm install
     ```

3. **Setup**:
   - Erstellen Sie eine `.env`-Datei im Projektverzeichnis und fügen Sie Ihren OpenAI-API-Schlüssel hinzu:
     ```env
     OPENAI_API_KEY=Ihr_API_Schlüssel
     ```

4. **Starten Sie das Programm**:
   - Führen Sie den folgenden Befehl aus:
     ```bash
     npm start
     ```

---

## Hauptfunktionen

### Startanimation
Beim Start des Programms wird eine ASCII-Animation angezeigt, die den Benutzer willkommen heißt. Diese Animation kann durch Drücken der `Enter`-Taste übersprungen werden.

### Hauptmenü
Das Hauptmenü bietet Zugriff auf die folgenden Optionen:
- **Allgemeiner Feed**: Zeigt alle verfügbaren Nachrichten an.
- **Favoriten**: Zeigt Ihre favorisierten Nachrichten an.
- **Kategorien**: Ermöglicht die Navigation durch kategorisierte Feeds.
- **Verwaltung**: Bearbeiten Sie RSS-Feeds und Kategorien.
- **Synchronisation**: Aktualisieren Sie die Datenbank mit den neuesten Feeds.

Navigieren Sie mit den Pfeiltasten und wählen Sie eine Option mit `Enter` aus. Oder Benutzen sie die Hotkeys 1-6 für schnelleren Zugriff auf die Menüauswahl.

### Navigationsleiste und Hilfe-Box
Am unteren Rand des Bildschirms befindet sich eine Navigationsleiste mit einer integrierten Hilfe-Box. Diese bietet:

Kontextbezogene Hilfe: Zeigt verfügbare Tastenkombinationen für den aktuellen Bildschirm an.
Statusmeldungen: Informiert über den aktuellen Status oder Aktionen (z.B. "Lade Feeds..." oder "Favorit hinzugefügt").
Navigationspfad: Zeigt, wo Sie sich in der Anwendung befinden (z.B. "Hauptmenü > Kategorien > Nachrichten").
Die Hilfe-Box ist dynamisch und aktualisiert sich automatisch, wenn Sie zwischen verschiedenen Bereichen der Anwendung wechseln. Sie dient als schnelle Referenz und hilft Ihnen, die verfügbaren Optionen ohne Unterbrechung Ihres Workflows zu verstehen.

Achten Sie stets auf die Hilfe-Box, um zu erfahren, welche Tastenkombinationen in Ihrem aktuellen Kontext verfügbar sind. Dies erleichtert die Navigation und Verwendung aller Funktionen des RSS-Feed-Readers.

### Synchronisation
Die Synchronisation lädt neue Feeds herunter und kategorisiert Nachrichten. Während der Synchronisation wird eine Benachrichtigung angezeigt. Diese Funktion kann über das Hauptmenü gestartet werden.

### RSS-Feed-Anzeige
In der Feed-Ansicht können Sie:
- Mit den Pfeiltasten durch die Nachrichten navigieren.
- Mit `o` einen Link öffnen.
- Mit `f` eine Nachricht zu den Favoriten hinzufügen.
- Mit `q` zur vorherigen Ansicht zurückkehren.

### Kategorien- und Feed-Verwaltung
- **RSS-Feeds bearbeiten**: Hinzufügen, Bearbeiten oder Löschen von Feed-URLs.
- **Kategorien bearbeiten**: Verwalten Sie Kategorien für eine bessere Organisation.

---

## Tastenkombinationen
Die wichtigsten Tastenkombinationen sind:
- `Enter`: Auswahl bestätigen
- `Pfeiltasten`: Navigation
- `q`: Zurück zur vorherigen Ansicht
- `Ctrl+C`: Programm beenden

Weitere Tastenkombinationen werden in der kontextuellen Hilfe am unteren Bildschirmrand angezeigt.

---

## Fehlerbehebung
- **Problem**: Das Programm startet nicht.
  - **Lösung**: Stellen Sie sicher, dass Node.js installiert ist und die Abhängigkeiten mit `npm install` installiert wurden.

- **Problem**: Die Synchronisation schlägt fehl.
  - **Lösung**: Überprüfen Sie Ihre Internetverbindung und stellen Sie sicher, dass der OpenAI-API-Schlüssel korrekt ist.

- **Problem**: Die Benutzeroberfläche reagiert nicht.
  - **Lösung**: Beenden Sie das Programm mit `Ctrl+C` und starten Sie es neu.

---

## Platzhalter für Screenshots
Fügen Sie hier Screenshots ein, um die Nutzung zu verdeutlichen:
- **Hauptmenü**: ![Hauptmenü](#)
- **RSS-Feed-Anzeige**: ![RSS-Feed-Anzeige](#)

---

Vielen Dank, dass Sie den RSS-Feed-Reader verwenden! Bei weiteren Fragen oder Problemen wenden Sie sich bitte an den Entwickler.