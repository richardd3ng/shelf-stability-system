#!/bin/python3

import os
import paramiko 
from datetime import datetime, timedelta
import json
import requests
import traceback

# The folder to place backups on the backup server
BACKUPS_FOLDER = 'TODO'
# A discord webhook to post status updates to
WEBHOOK_URL = 'TODO'
# The production server URL
SERVER_URL = 'TODO'
# The username to use to ssh into the production server
SERVER_USER = 'TODO'
# The path (on the backup server) to the private ssh key to use to log into the production server
SERVER_AUTH_KEY = 'TODO'
# The password used to authenticate with the postgres database
DB_PASSWORD = 'TODO'

DAILY_BACKUPS = 7
WEEKLY_BACKUPS = 4
MONTHLY_BACKUPS = 12

CONFIG_FILE = 'backup_status.json'
DATE_FORMAT = '%Y-%m-%d_%H%M%S'

def main():
    webhook_id = post_webhook("🔄 Backup starting...")
    try:
        os.makedirs(BACKUPS_FOLDER, exist_ok=True)
        config = load_config()
        latestDaily = daily_backup(config)
        bump_backups(config, latestDaily)
        save_config(config)
        edit_webhook(webhook_id, "✅ Backup complete")
    except:
        post_webhook("❌ Backup failed @everyone - " + traceback.format_exc())

def load_config():
    # Load the config file
    if not os.path.exists(CONFIG_FILE):
        config = open(CONFIG_FILE, 'w')
        config.write('{"daily": [], "weekly": [], "monthly": []}')
        config.close()

    with open(CONFIG_FILE) as f:
        config = json.load(f)
        return config

def daily_backup(config: dict):
    ssh = paramiko.SSHClient()

    # insecure but not sure I care for this
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    ssh.connect(SERVER_URL, username=SERVER_USER, key_filename=SERVER_AUTH_KEY)
    _, stdout, _ = ssh.exec_command(f'PGPASSWORD="{DB_PASSWORD}" pg_dump postgres')
    stdout.channel.recv_exit_status()
    result = stdout.read()

    now = datetime.now()
    dateStr = now.strftime(DATE_FORMAT)
    latestFile = f'daily-{dateStr}.sql'
    file = open(latestFile, 'wb')
    file.write(result)
    return dateStr

def bump_backups(config: dict, latestDaily: str):
    latestWeekly = datetime.strptime(config['weekly'][-1], DATE_FORMAT).date() if len(config['weekly']) > 0 else None
    latestMonthly = datetime.strptime(config['monthly'][-1], DATE_FORMAT).date() if len(config['monthly']) > 0 else None

    config['daily'].append(latestDaily)
    oldestDaily = datetime.strptime(config['daily'][0], DATE_FORMAT).date() if len(config['daily']) > 0 else None

    # Too many daily backups, delete or promote oldest
    if len(config['daily']) > DAILY_BACKUPS:
        removed = config['daily'].pop(0)
        # If the last weekly backup is more than 7 days behind the oldest daily, shift down the oldest daily backup
        if latestWeekly == None \
            or latestWeekly <= oldestDaily - timedelta(days=7):
            config['weekly'].append(removed)
            os.rename(f'daily-{removed}.sql', f'weekly-{removed}.sql')
        else:
            os.remove(f'daily-{removed}.sql')

    oldestWeekly = datetime.strptime(config['weekly'][0], DATE_FORMAT).date() if len(config['weekly']) > 0 else None

    # Too many weekly backups, delete or promote oldest
    if len(config['weekly']) > WEEKLY_BACKUPS:
        removed = config['weekly'].pop(0)
        # If the last monthly backup is more than 30 days behind the oldest weekly, shift down the oldest weekly backup
        if latestMonthly == None \
            or latestMonthly <= oldestWeekly - timedelta(days=30):
            config['monthly'].append(removed)
            os.rename(f'weekly-{removed}.sql', f'monthly-{removed}.sql')
        else:
            os.remove(f'weekly-{removed}.sql')

    # Too many monthly backups, delete oldest
    if len(config['monthly']) > MONTHLY_BACKUPS:
        removed = config['monthly'].pop(0)
        os.remove(f'monthyl-{removed}.sql')

def save_config(config: dict):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f)

def post_webhook(message):
    res = requests.post(f'{WEBHOOK_URL}?wait=true', {
        "username": "Backup Alerts",
        "content": message
    })
    return res.json()['id']

def edit_webhook(id, message):
    requests.patch(f'{WEBHOOK_URL}/messages/{id}', {
        "content": message
    })

if __name__ == '__main__':
    main()
    