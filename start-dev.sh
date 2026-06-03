#!/bin/bash
cd /home/z/my-project
NODE_OPTIONS='--max-old-space-size=4096' npx next dev -p 3000 > /home/z/my-project/dev.log 2>&1
