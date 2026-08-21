# Orbit client setup

Orbit is an independent Android client derived from the official Telegram Android source under GPL-2.0-or-later. It is not affiliated with Telegram.

## Required configuration before a functional login build

Telegram clients require an API ID and API hash registered for the distributing application. The source deliberately ships with `APP_ID = 0` and an empty `APP_HASH`; this prevents reuse of the official Telegram application's credentials.

Before building a release that can log in, provide credentials registered for Orbit as the encrypted repository secrets `ORBIT_API_ID` and `ORBIT_API_HASH`. The Gradle build injects them into the APK and does not write them back to the source tree. Do not commit private credentials to a public repository.

## Local client features included

| Feature | Behavior |
| --- | --- |
| Custom application font | Imports a user-selected TTF or OTF through Android's document picker, validates the font header and size, stores it only in private app storage, and applies it to the interface font loader. |
| Reset font | Deletes the local font and returns to the default interface typeface. |
| Local-only policy | The client does not add access to deleted messages, locked media, private stories, or any other content unavailable to the signed-in account. |

## Distribution obligations

Publish the corresponding modified source when distributing the APK, preserve applicable license notices, and use branding that does not imply an official Telegram release.
