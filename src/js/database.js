import firebase from 'firebase/app'
import 'firebase/database'

const config = {
  apiKey: 'AIzaSyBrYOM3aCg7bOpQ_vpsMa3WJ9m5I5HI4CM',
  authDomain: 'attestation-covid-irf.firebaseapp.com',
  databaseURL: 'https://attestation-covid-irf.firebaseio.com',
  storageBucket: 'attestation-covid-irf.appspot.com'
}

firebase.initializeApp(config)

const database = firebase.database()

export function getPerson (personId, callback) {
  return database.ref('/' + personId).once('value').then(function (snapshot) {
    callback(snapshot.val())
  })
}
