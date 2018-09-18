git init
git add .
git commit -m "Delopyment"
heroku git:remote -a cvmqs
git push -f heroku master
echo "open url https://cvmqs.herokuapp.com/"