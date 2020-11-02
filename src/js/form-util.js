import { $, $$, downloadBlob } from './dom-utils'
import { jquery } from './jquery.js'
import { addSlash, getFormattedDate } from './util'
import pdfBase from '../certificate.pdf'
import { generatePdf } from './pdf-util'

const conditions = {
  '#field-firstname': {
    length: 1,
  },
  '#field-lastname': {
    length: 1,
  },
  '#field-birthday': {
    pattern: /^([0][1-9]|[1-2][0-9]|30|31)\/([0][1-9]|10|11|12)\/(19[0-9][0-9]|20[0-1][0-9]|2020)/g,
  },
  '#field-placeofbirth': {
    length: 1,
  },
  '#field-address': {
    length: 1,
  },
  '#field-city': {
    length: 1,
  },
  '#field-zipcode': {
    pattern: /\d{5}/g,
  },
  '#field-datesortie': {
    pattern: /\d{4}-\d{2}-\d{2}/g,
  },
  '#field-heuresortie': {
    pattern: /\d{2}:\d{2}/g,
  },
}

function validateAriaFields () {
  return Object.keys(conditions)
    .map((field) => {
      const fieldData = conditions[field]
      const pattern = fieldData.pattern
      const length = fieldData.length
      const isInvalidPattern = pattern && !$(field).value.match(pattern)
      const isInvalidLength = length && !$(field).value.length

      const isInvalid = !!(isInvalidPattern || isInvalidLength)

      $(field).setAttribute('aria-invalid', isInvalid)
      if (isInvalid) {
        $(field).focus()
      }
      return isInvalid
    })
    .includes(true)
}

export function setReleaseDateTime (releaseDateInput) {
  const loadedDate = new Date()
  releaseDateInput.value = getFormattedDate(loadedDate)
}

export function getProfile (formInputs) {
  const fields = {}
  for (const field of formInputs) {
    let value = field.value
    if (field.id === 'field-datesortie') {
      const dateSortie = field.value.split('-')
      value = `${dateSortie[2]}/${dateSortie[1]}/${dateSortie[0]}`
    }
    fields[field.id.substring('field-'.length)] = value
  }
  return fields
}

export function getReasons (reasonInputs) {
  const reasons = reasonInputs
    .filter(input => input.checked)
    .map(input => input.value).join(', ')
  return reasons
}

export function prepareInputs (formInputs, reasonInputs, reasonFieldset, reasonAlert, snackbar) {
  formInputs.forEach((input) => {
    const exempleElt = input.parentNode.parentNode.querySelector('.exemple')
    const validitySpan = input.parentNode.parentNode.querySelector('.validity')
    if (input.placeholder && exempleElt) {
      input.addEventListener('input', (event) => {
        if (input.value) {
          exempleElt.innerHTML = 'ex.&nbsp;: ' + input.placeholder
          validitySpan.removeAttribute('hidden')
        } else {
          exempleElt.innerHTML = ''
        }
      })
    }
  })

  $('#field-birthday').addEventListener('keyup', function (event) {
    event.preventDefault()
    const input = event.target
    const key = event.keyCode || event.charCode
    if (key !== 8 && key !== 46) {
      input.value = addSlash(input.value)
    }
  })

  reasonInputs.forEach(radioInput => {
    radioInput.addEventListener('change', function (event) {
      const isInError = reasonInputs.every(input => !input.checked)
      reasonFieldset.classList.toggle('fieldset-error', isInError)
      reasonAlert.classList.toggle('hidden', !isInError)
    })
  })

  $('#generate-btn').addEventListener('click', async (event) => {
    event.preventDefault()

    const reasons = getReasons(reasonInputs)
    if (!reasons) {
      reasonFieldset.classList.add('fieldset-error')
      reasonAlert.classList.remove('hidden')
      reasonFieldset.scrollIntoView && reasonFieldset.scrollIntoView()
      return
    }

    const invalid = validateAriaFields()
    if (invalid) {
      return
    }

    console.log(getProfile(formInputs), reasons)

    const pdfBlob = await generatePdf(getProfile(formInputs), reasons, pdfBase)

    const creationInstant = new Date()
    const creationDate = creationInstant.toLocaleDateString('fr-CA')
    const creationHour = creationInstant
      .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      .replace(':', '-')
    savePerson()
    downloadBlob(pdfBlob, `attestation-${creationDate}_${creationHour}.pdf`)

    snackbar.classList.remove('d-none')
    setTimeout(() => snackbar.classList.add('show'), 100)

    setTimeout(function () {
      snackbar.classList.remove('show')
      setTimeout(() => snackbar.classList.add('d-none'), 500)
    }, 6000)
  })

  jquery('[id^=radio-]').on('click', handleMoveClick)
}

function getInput (inputName) {
  return jquery(`#field-${inputName}`)
}

function getProperty (propertyName) {
  return getInput(propertyName).val()
}

function createEmptyPerson () {
  return {
    firstname: '',
    lastname: '',
    birthday: '',
    placeofbirth: '',
    address: '',
    city: '',
    zipcode: '',
  }
}

function createPerson () {
  return {
    firstname: getProperty('firstname'),
    lastname: getProperty('lastname'),
    birthday: getProperty('birthday'),
    placeofbirth: getProperty('placeofbirth'),
    address: getProperty('address'),
    city: getProperty('city'),
    zipcode: getProperty('zipcode'),
  }
}

function savePerson () {
  document.cookie = `attestation-covid-person=${JSON.stringify(createPerson())};expires=Fri, 31 Dec 2021 23:59:59 UTC;path=/`
}

function getMove (event) {
  return jquery(event.target).val()
}

function getPersonCookieValue () {
  const optionalPersonCookieValue = document.cookie.match(/attestation-covid-person=([^;]*)/)
  return !optionalPersonCookieValue ? '' : optionalPersonCookieValue[1]
}

function getPerson () {
  return !getPersonCookieValue() ? createEmptyPerson() : JSON.parse(getPersonCookieValue())
}

function updateFormFromPerson (person) {
  getInput('firstname').val(person.firstname)
  getInput('lastname').val(person.lastname)
  getInput('birthday').val(person.birthday)
  getInput('placeofbirth').val(person.placeofbirth)
  getInput('address').val(person.address)
  getInput('city').val(person.city)
  getInput('zipcode').val(person.zipcode)
}

function updateFormFromMove (move) {
  const heuresortie = new Date()
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  getInput('heuresortie').val(heuresortie)
  jquery('[id^=checkbox-]').prop('checked', false)
  jquery('#checkbox-' + move).prop('checked', true)
  jquery('#generate-btn').trigger('click')
}

function handleMoveClick (event) {
  updateFormFromPerson(getPerson())
  updateFormFromMove(getMove(event))
}

export function prepareForm () {
  const formInputs = $$('#form-profile input')
  const snackbar = $('#snackbar')
  const reasonInputs = [...$$('input[name="field-reason"]')]
  const reasonFieldset = $('#reason-fieldset')
  const reasonAlert = reasonFieldset.querySelector('.msg-alert')
  const releaseDateInput = $('#field-datesortie')
  setReleaseDateTime(releaseDateInput)
  prepareInputs(formInputs, reasonInputs, reasonFieldset, reasonAlert, snackbar)
}
