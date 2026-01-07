#!/bin/bash
echo "🔄 RESTORING TO PRE-WIKIPEDIA STATE..."
git reset --hard backup-before-wikipedia
git push origin main --force
echo "✅ RESTORE COMPLETE - Check Render in 2 minutes"
