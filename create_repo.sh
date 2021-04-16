#!/bin/sh
echo ""
echo "========= Create new Reopo Now =======>"
git init
echo ""
echo "Enter README title:"
read README
echo "# $README" >> README.md
git add .
git status
echo "Enter Commit message:"
read commitMessage
git commit -m "$commitMessage"
git branch -M main
echo "Enter github repo link"
read gitlink
git remote add origin $gitlink
git push -u origin main
echo ""
echo ""
echo "----- Here's your git log --------"
git log
