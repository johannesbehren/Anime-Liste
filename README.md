# Anime-Liste
Eine simple Website, als eine Art Watchlist für Animes

# Erklärung
HTML ist das zu ausführende Datei, um es auf der Webbrowser zu öffnen.

Die Eigenschaften:
- Es gibt Kategorien:
  - Animes, die ich geschaut habe
  - Animes, die ich schauen will
  - Animes, die ich nicht mochte
- Es gibt A-Z + # (Zahl) für das eintragen der Animes.
- Das eintragen der Animes in diese Listen wird auf der Website selbst erklärt.
- Nach eintragen des Animes, kann es mit Rechtsklick ein "Notiz für: {AnimeName}" geöffnet werden und darin die vom Anime angegebene Beschreibung in die Notiz zu übertragen, um im Vorraus es kennenzulernen. Plus ein Vorlesebot kann für den Nutzer (du selbst) anfangen vor zu lesen
- Im Bereich "Animes, die ich schauen will"  wird es nach dem Eintragen des gewünschten Animes, ein grünes und rotes Quadrat (Knopf) angezeigt
  - Bedeutung:
    - Grün: Anime wurde fertig geschaut und wird bei klick in die Liste "Animes, die ich geschaut habe" verschoben
    - Rot: Anime ist nicht im Geschmack des Zuschauers (Du selbst) und es wird bei klick in die Liste "Animes, die ich nicht mochte" verschoben
- Die eingetragenen Animes werden automatisch im 'LocalStorage' des jeweiligen Browser gespeichert und die Website kann neu geladen werden, ohne die eingetragen Animes zu verlieren.
- Eine Möglichkeit die Dateien auf dem Gerät selbst zu speichern geht auch (oben rechts zu finden). Es werden alles gespeichert was auch die Website anzeigt, als eine JSON Datei
- Aufgelistete Animes sind leicht zu löschen, indem man den Mülleimer rechts neben dem aufgelisteten Anime klickt.
- Im Bereich Notiz
  1. Beschreibung des Animes eingeben
  2. Beste Momente eingeben
    - Staffel | Episode | Zeit | Zitat / Beschreibung
      - _Beispiel: 1 | 1 | 1:01 | Es war einmal ein Hase..._
