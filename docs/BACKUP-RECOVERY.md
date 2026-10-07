# Recovering a store from an automatic backup

Keep recovery credentials outside the database being backed up: the exact `SESSION_SECRET` used for encrypted integrations, Cloudinary account identity/API credentials, the database administrator credentials, repository revision and access to the hosting account. Use a secure password manager or a separate protected recovery vault. A database dump cannot bootstrap access to the service that stores that dump.

The automatic backup is a private authenticated raw Cloudinary asset. Obtain its public ID and download it through an authenticated account tool or a short-lived signed `private_download_url` for the raw asset. Do not make the backup public or paste its URL into logs/tickets. Cloudinary documents [account downloads](https://cloudinary.com/documentation/ts_how_can_i_download_my_accounts_assets) and [signed private downloads](https://cloudinary.com/documentation/image_upload_api_reference#private_download_url). The audit did not verify the exact authenticated-raw download control in this account's Media Library; rehearse retrieval while the live application is still healthy.

1. Create a completely new empty database with `restore` or `test` in its name. Keep the live store separate. Restrict access to the recovery machine and database.
2. Check out the repository revision identified by the backup and install its frozen dependencies. Preserve the backup file and verify its format/migration manifest. Recover the original session secret from the separate vault.
3. Point `DATABASE_URL` only at the empty recovery database and run `pnpm restore -- <downloaded-file.jsonl.gz>`. The restore command validates the full file first, creates its matching schema, loads all data in one pinned transaction, checks counts/foreign keys/order counter, applies subsequent migrations and reconciles money/stock.
4. Require a successful exit code, matching encryption-key check, every saved integration secret decrypted, and successful reconciliation. Read the report counts. If the file is truncated, a foreign key fails, a secret cannot be decrypted or a migration fails, keep the recovery database isolated and investigate. Do not cut over merely because rows were loaded.
5. Start the recovered store privately. Test owner login, order access, current prices/stock, bank instructions and relevant integrations with controlled test cases. Review queued `sending`/`unknown` notices before any resend. Review unresolved card initiation with Pagopar to avoid a second charge.
6. Compare the intended restored data and latest available backup time with the live incident. Plan a controlled cutover only after these checks. Preserve the previous live database and recovery evidence until the store has been verified.

Format 2 includes the application/schema version, database version, table inventory, an encryption-key check, final row counts and a SHA-256 checksum. The checksum detects damage; it is not a substitute for authenticated retrieval. The restore refuses an existing populated target or a newer incompatible initialized schema. Restore an older backup into a fresh database so its original schema can be loaded before upgrade migrations.

Legacy backups require explicit `--legacy`. They lack the format-2 closing checksum and version guarantees; recover them into an empty isolated database and perform a separate complete validation. `--vaciar` no longer deletes a live database. Recovery never changes the source backup or the live store automatically.

For a repeatable local verification, retrieve the private asset manually and run
`pnpm backup:verify -- /private/path/backup.jsonl.gz`. This checks the manifest,
schema table inventory, complete counts/checksum and the encryption-key match
when the original key is available. It does not download assets or prove that
the production scheduler is running. Never paste the signed retrieval URL.
Add `--restore` only with `DATABASE_URL` privately pointing at an empty loopback
database whose name contains `test` and ends in `_restore_check`. That opt-in
path loads and upgrades the backup, verifies decryption and reconciliation;
it refuses a live/remote target. Keep the recovery environment isolated.
Health and the owner dashboard flag enabled backups without a completed run
within 26 hours; started or failed runs do not count as fresh backups.
