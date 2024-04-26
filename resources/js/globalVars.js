const platform = "Web";
const mobile = "Android";
const isWebMobile = /Mobi/.test(navigator.userAgent);
const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches;

var addIMG = false; var binIMG = false; var editIMG = false; var grabIMG = false; var pauseIMG = false; var playIMG = false; var sound_fullIMG = false; 
var sound_midIMG = false; var sound_lowIMG = false; var sound_offIMG = false; var timer2IMG = false; var tickIMG = false; var arrowIMG = false;

const green = "#1DBC60"; const orange = "#E67E22"; const red = "#E74C3C"; const blue = "#477DB3"; const yellow ="#FFCD02"; const dark_blue = "#1F1C2D"; const black = "#000000";
const mid_green = "#4AC980"; const mid_orange = "#EB984E"; const mid_red = "#EC7063"; const mid_yellow = "#FFE167"; const mid_blue = "#6c97c2"; const mid_dark_blue = "#29293F";
const light_orange = "#f2bc8c"; const light_green = "#65e79b"; const light_red = "#f3a49b"; const light_blue = "#a0bdd9"; const light_yellow = "#ffeb9a"; const light_dark_blue = "#3B3B5B";

const dayofweek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthofyear = ["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"];
const dayofweek_conventional = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const textAssets = {
    "french": {
        "misc": {
            "abrMonthLabels": {
                "Jan": "Jan",
                "Feb": "Fev",
                "March": "Mars",
                "April": "Avril",
                "May": "Mai",
                "June": "Juin",
                "July": "Juil",
                "Aug": "Aout",
                "Sept": "Sept",
                "Oct": "Oct",
                "Nov": "Nov",
                "Dec": "Dec",
            },
            "dayLabels" : {
                "monday": "Lundi",
                "tuesday": "Mardi",
                "wednesday": "Mercredi",
                "thursday": "Jeudi",
                "friday": "Vendredi",
                "saturday": "Samedi",
                "sunday": "Dimanche"
            },
            "dayInitials" : {
                "monday": "L",
                "tuesday": "M",
                "wednesday": "M",
                "thursday": "J",
                "friday": "V",
                "saturday": "S",
                "sunday": "D"
            },
            "rightInitial": "D",
            "leftInitial": "G",
            "right": "Droit",
            "left": "Gauche",
            "dayAbbrTimeString": "j",
            "yearAbbrTimeString": "a",
            "submit": "Confirmer"
        },
        "stats": {
            "timeSpent" : "Temps en séance",
            "workedTime" : "Temps sous tension",
            "weightLifted" : "Charge soulevée",
            "repsDone" : "Répétitions effectuées",
            "since" : "Depuis le",
        },
        "preferences": {
            "preferences": "Paramètres",
            "language": "Langue",
            "weightUnit": "Unité de charge",
            "notifBefore": "Avance notification",
            "keepHistory": "Garder l'historique",
            "forEver" : "Toujours",
            "sDays" : "7 Jours",
            "oMonth" : "1 Mois",
            "tMonth" : "3 Mois",
            "sMonth" : "6 Mois",
            "oYear" : "1 An",
            "keepAwake": "Toujours allumé",
            "autoSaver": "Economiseur auto",
            "export": "Exporter",
            "import": "Importer",
            "impExpMenu": {
                "selectElements": "Choisissez",
                "sessionList": "Seances",
                "reminderList": "Rappels",
                "preferences": "Paramètres",
                "stats": "Statistiques",
                "emptyMessage": "Aucun élément sauvegardé"
            }
        },
        "calendar": {
            "forWard": "Avant",
            "backWard": "Arrière",
            "shiftByOne": "Décaler d'un jour",
            "emptyMessage": "Aucune séance programmée"
        },
        "recovery": {
            "recovery": "Sauvegarde",
            "subText2": " s'est arrêté de manière inattendue, reprendre ?",
            "no": "Non",
            "yes": "Oui",
        },
        "sessionItem": {
            "schedule": "Programmer",
            "history": "Historique",
            "addASession": "Créer une séance"
        },
        "updatePage": {
            "name": "Nom",
            "reminderBody": "Corps du Rappel",
            "on": "A partir de",
            "at": "A",
            "every": "Tout les",
            "create": "Créer",
            "update": "Actualiser",
            "delete": "Supprimer",
            "add": "Ajouter",
            "schedule": "Programmer",
            "break": "Pause",
            "cycle": "Cycle",
            "work": "Travail",
            "rest": "Repos",
            "emptyHistory": "Pas encore d'historique",
            "disabledHistory": "L'historique est désactivé",
            "temporalityChoices": {
                "day": "Jour",
                "week": "Semaine"
            },
            "itemTypeChoices": {
                "session": 'Seance',
                "reminder": "Rappel"
            },
            "placeHolders": {
                "name": "Nom",
                "sets": "Séries",
                "reps": "Reps",
                "rest": "Repos",
                "body": "Coprs",
                "hint": "Indication",
                "type": 'Type',
                "pause": "Pause"
            },
            "exerciseTypes": {
                "Bi." : "Bilatéral",
                "Uni.": "Unilatéral",
                "Int.": "Intervalle",
                "Wrm.": "Echauff",
                "Pause": 'Pause'
            }
        },
        "screenSaver": {
            "saver": "Economiseur",
        },
        "inSession": {
            "noMore": "Plus de séries",
            "start": "Début",
            "rest": "Repos",
            "next": "Suivant",
            "last": "Dernier",
            "done": "Fini",
            "finished": "Terminer",
            "end": "Fin",
            "quit": "Quitter",
            "cancel": "Annuler",
            "exitQuestion": "Quitter la séance ?",
            "exitDetails": "Votre progression pourrait être perdue",
            "remaining": {
                "reSets": "Séries restantes",
                "reReps": "Répétitions restantes",
                "reTime": "Temps restant",
                "reWoTime": "Temps travail restant",
                "reWeight": "Charge restante"
            },
        },
        "inIntervall": {
            "getReady": "Préparation",
            "work": "Travail",
            "rest": "Repos",
            "end": "Fin",
        },
        "notification": {
            "duration": "Durée",
            "restOver": "Repos terminé",
            "workOver": "Travail terminé",
            "xRestOver": "Repos extra terminé",
            "breakOver": "Pause terminée"
        },
        "error": {
            "updatePage": {
                "nameAlreadyUsed": "Nom déjà utilisé",
                "fillAllEntries": "Remplissez toutes les entrées",
                "intNumericOnly": "Cycle et Travail doivent être numérique",
                "restTimeOnly": "Repos doit être temporel",
                "restGreater": "Repos doit être supérieur à 4s",
                "workGreater": "Travail doit être supérieur à 5s",
                "workRestTooBig": "Travail ou Repos bien trop grand",
                "totalTooBig": "Temps total bien trop grand",
                "cycleMinimum" : "Il doit y avoir minimum 1 cycle",
                "noComma": "Le nom ne peut pas contenir de virgule",
                "workNumericOnly": "Série, Répétiton et Poids doivent être numérique",
                "zeroSet": "Il ne peut pas y avoir 0 série",
                "zeroRep": "Il ne peut pas y avoir 0 répétition",
                "weightNumeric": 'Poids doit être numérique',
                "goToSleep": "Tu peux également faire une sieste",
                "breakNumeric": "Pause doit être temporel",
                "consecutiveBreak": "Les pauses consécutives ne servent à rien",
                "zeroBreak": "Pause trop petite"
            },
            "schedule": {
                "hoursMinNumeric": "Heure, Minute et Nombre doivent être numérique",
                "greatherHours": "Heure ne peut pas être supérieur à 23",
                "greaterMinutes": "Minute ne peut pas être supérieur à 59",
                "timePassed": "Le temps est déjà passé",
                "notScheduled": "Cette séance n'est pas encore programmée"
            },
            "parameters": {
                "notifTime": "Avance doit être temporelle",
                "notifTooLarge": "Avance trop grande",
                'notifTooSmall': "Avance trop petite"
            }
        },
        "bottomNotif": {
            "scheduled": "programmée",
            "unscheduled": "déprogrammé",
            "created": "crée",
            "deleted": "supprimé",
            "updated": "mis à jour",
            "IOprefix": "Données",
            "imported": "importées avec succès",
            "exported": "exportées avec succès",
            "parameters": "mis à jour",
            "read": "Permission de lecture refusée",
            "write": "Permission d'écriture refusée",
            "audioBroken": "Contrôle du son non disponible"
        },
        "sessionEnd": {
            "mainText": {
                "congrats": "Félicitation !",
                "failed": "Quel échec !",
                "chrono": {
                    "good": {
                        "0": "Si rapide !",
                        "1": "Impressionnant !",
                        "2": "Flash c'est vous ?",
                    },
                    "even": {
                        "0": "Comme d'habitude",
                        "1": "Tu es constant",
                        "2": "Normal"
                    },
                    "bad": {
                        "0": "Pas ton meilleur",
                        "1": "Tu as fais mieux",
                        "2": "T'es mou chef"
                    }
                },
                "weight": {
                    "good": {
                        "0": "Si fort !",
                        "1": "Puissance pure !",
                        "2": "Qui te peux ?"
                    },
                    "even": {
                        "0": "Rien de fou",
                        "1": "Plutôt banal",
                        "2": "Pas mal !"
                    },
                    "bad": {
                        "0": "Tu te sens faible ?",
                        "1": "Pense à te reposer",
                        "2": "La prochaine !"
                    }
                },
            },
            "subText": {
                "failed": {
                    "0": "Frérot, ne lâche pas comme ça, tu en avais encore !",
                    "1": "Hé, tu as déjà fais beaucoup mieux, baisse pas les bras !",
                    "2": "Continue à pousser, l'échec n'est qu'une étape vers le succès !",
                    "3": "Tu as trébuché, mais ce n'est pas la fin, relève-toi plus fort !",
                    "4": "L'échec est temporaire, relève-toi et essaie à nouveau !",
                    "5": "C'est un revers, pas une défaite, continue à progresser !"
                },
                "congrats": {
                    "YC": "Tu as complété ",
                    "FT": " pour la ",
                    "T": " fois"
                },
                "chrono": {
                    "YHB": "Tu as été ",
                    "YT": "Tu as pris "
                },
                "weight":{
                    "YHL": "Tu as soulevé ",
                }
            },
            "interestWord": {
                "chrono": {
                    "faster": "% plus rapide",
                    "slower": "% plus lent",
                    "even": "autant de temps"
                },
                "weight": {
                    "more": "% plus lourd",
                    "less": "% plus léger",
                    "even": "autant"
                }
            },
            "common": {
                "TTLT": ' que la fois dernière',
                "ATLT": ' que la fois dernière'
            }
        }
    },
    "english": {
        "misc": {
            "abrMonthLabels": {
                "Jan": "Jan",
                "Feb": "Feb",
                "March": "March",
                "April": "April",
                "May": "May",
                "June": "June",
                "July": "July",
                "Aug": "Aug",
                "Sept": "Sept",
                "Oct": "Oct",
                "Nov": "Nov",
                "Dec": "Dec",
            },
            "dayLabels" : {
                "monday": "Monday",
                "tuesday": "Tuesday",
                "wednesday": "Wednesday",
                "thursday": "Thursday",
                "friday": "Friday",
                "saturday": "Saturday",
                "sunday": "Sunday"
            },
            "dayInitials" : {
                "monday": "M",
                "tuesday": "T",
                "wednesday": "W",
                "thursday": "T",
                "friday": "F",
                "saturday": "S",
                "sunday": "S"
            },
            "rightInitial": "R",
            "leftInitial": "L",
            "right": "Right",
            "left": "Left",
            "dayAbbrTimeString": "d",
            "yearAbbrTimeString": "y",
            "submit": "Submit"
        },
        "stats": {
            "timeSpent" : "Time spent",
            "workedTime" : "Worked time",
            "weightLifted" : "Weight lifted",
            "repsDone" : "Reps done",
            "since" : "Since",
        },
        "preferences": {
            "preferences": "Preferences",
            "language": "Language",
            "weightUnit": "Weight unit",
            "notifBefore": "Notif before",
            "keepHistory": "Keep history",
            "forEver" : "Forever",
            "sDays" : "7 Days",
            "oMonth" : "1 Months",
            "tMonth" : "3 Months",
            "sMonth" : "6 Months",
            "oYear" : "1 Year",
            "keepAwake": "Keep awake",
            "autoSaver": "Auto saver",
            "export": "Export",
            "import": "Import",
            "impExpMenu": {
                "selectElements": "Select elements",
                "sessionList": "Sessions",
                "reminderList": "Reminders",
                "preferences": "Preferences",
                "stats": "Statistics",
                "emptyMessage": "Nothing saved"
            }
        },
        "calendar": {
            "forWard": "Forward",
            "backWard": "Backward",
            "shiftByOne": "Shift by one Day",
            "emptyMessage": "No session scheduled"
        },
        "recovery": {
            "recovery": "Recovery",
            "subText2": " unexpectedly stopped, resume it ?",
            "no": "No",
            "yes": "Yes",
        },
        "sessionItem": {
            "schedule": "Schedule",
            "history": "History",
            "addASession": "Create a session"
        },
        "updatePage": {
            "name": "Name",
            "reminderBody": "Reminder body",
            "on": "From",
            "at": "At",
            "every": "Every",
            "create": "Create",
            "update": "Update",
            "delete": "Delete",
            "add": "Add",
            "schedule": "Schedule",
            "break": "Break",
            "cycle": "Cycle",
            "work": "Work",
            "rest": "Rest",
            "emptyHistory": "No history yet",
            "disabledHistory": "History is disabled",
            "temporalityChoices": {
                "day": "Day",
                "week": "Week"
            },
            "itemTypeChoices": {
                "session": 'Session',
                "reminder": "Reminder"
            },
            "placeHolders": {
                "name": "Name",
                "sets": "Sets",
                "reps": "Reps",
                "rest": "Rest",
                "body": "Body",
                "hint": "Hint",
                "type": 'Type',
                "pause": "Break"
            },
            "exerciseTypes": {
                "Bi." : "Bilateral",
                "Uni.": "Unilateral",
                "Int.": "Interval",
                "Wrm.": "Warmup",
                "Pause": 'Break'
            }
        },
        "screenSaver": {
            "saver": "Saver",
        },
        "inSession": {
            "noMore": "No more sets",
            "start": "Start",
            "rest": "Rest",
            "next": "Next",
            "last": "Last",
            "done": "Done",
            "finished": "Finished",
            "end": "End",
            "quit": "Quit",
            "cancel": "Cancel",
            "exitQuestion": "Exit the session ?",
            "exitDetails": "Your progression could be lost",
            "remaining": {
                "reSets": "Sets remaining",
                "reReps": "Reps remaining",
                "reTime": "Time remaining",
                "reWoTime": "Working time remaining",
                "reWeight": "Weight remaining"
            },
        },
        "inIntervall": {
            "getReady": "Get Ready",
            "work": "Work",
            "rest": "Rest",
            "end": "End",
        },
        "notification": {
            "duration": "Duration",
            "restOver": "Rest over",
            "workOver": "Work over",
            "xRestOver": "Extra rest over",
            "breakOver": "Break over"
        },
        "error": {
            "updatePage": {
                "nameAlreadyUsed": "Name already used",
                "fillAllEntries": "Fill all entries",
                "intNumericOnly": "Cycle and Work only support numeric values",
                "restTimeOnly": "Rest only support time values",
                "restGreater": "Rest has to be greater that 4s",
                "workGreater": "Work has to be greater than 5s",
                "workRestTooBig": "Work or Rest time value way too big",
                "totalTooBig": "Total time way too big",
                "cycleMinimum": "Cycle minimum value is 1",
                "noComma": "Name cannot contain comma",
                "workNumericOnly": "Sets, Reps and Weight only support numeric values",
                "zeroSet": "Cannot do 0 set",
                "zeroRep": "Cannot do 0 rep",
                "weightNumeric": 'Weight must be Numeric',
                "goToSleep": "You might as well go to sleep",
                "breakNumeric": "Breaks only support time values",
                "consecutiveBreak": "There is no point in consecutive breaks",
                "zeroBreak": "Break too small"
            },
            "schedule": {
                "hoursMinNumeric": "Hours, Minutes and Count only support numeric values",
                "greatherHours": "Hours cannot be greater than 23",
                "greaterMinutes": "Minutes cannot be greater than 59",
                "timePassed": "Time has already passed",
                "notScheduled": "This session is not scheduled yet"
            },
            "parameters": {
                "notifTime": "Notif must be time",
                "notifTooLarge": "Before too big",
                'notifTooSmall': "Before too small"
            }
        },
        "bottomNotif": {
            "scheduled": "scheduled",
            "unscheduled": "unscheduled",
            "created": "created",
            "deleted": "deleted",
            "updated": "updated",
            "IOprefix": "Data",
            "imported": "successfully imported",
            "exported": "successfully exported",
            "parameters": "updated",
            "read": "Read permission error",
            "write": "Write permission error",
            "audioBroken": "Sound control not available"
        },
        "sessionEnd": {
            "mainText": {
                "congrats": "Congrats !",
                "failed": "Failed",
                "chrono": {
                    "good": {
                        "0": "So fast !",
                        "1": "Impressive speed !",
                        "2": "Lightning fast !",
                    },
                    "even": {
                        "0": "As usual",
                        "1": "Steady as always",
                        "2": "You do you"
                    },
                    "bad": {
                        "0": "Not your best",
                        "1": "You've done better",
                        "2": "Slower than usual"
                    }
                },
                "weight": {
                    "good": {
                        "0": "So strong !",
                        "1": "Unbelievably mighty !",
                        "2": "Big boy !"
                    },
                    "even": {
                        "0": "Nothing crazy",
                        "1": "Fairly typical",
                        "2": "Not bad !"
                    },
                    "bad": {
                        "0": "Feeling weak ?",
                        "1": "Don't forget to rest",
                        "2": "Better next time !"
                    }
                },
            },
            "subText": {
                "failed": {
                    "0": "Bro, don't give up like that, you've got more in you!",
                    "1": "Hey, that's not your best effort, you've got this!",
                    "2": "Keep pushing, failure is just a step towards success!",
                    "3": "You've stumbled, but it's not the end, rise up stronger!",
                    "4": "Failure is temporary, get back up and give it another shot!",
                    "5": "It's a setback, not defeat, keep striving for progress!"
                },
                "congrats": {
                    "YC": "You completed ",
                    "FT": " for the ",
                    "T": " time"
                },
                "chrono": {
                    "YHB": "You have been ",
                    "YT": "You took "
                },
                "weight":{
                    "YHL": "You have lifted ",
                }
            },
            "interestWord": {
                "chrono": {
                    "faster": "% faster",
                    "slower": "% slower",
                    "even": "as long"
                },
                "weight": {
                    "more": "% heavier",
                    "less": "% lighter",
                    "even": "as much"
                }
            },
            "common": {
                "TTLT": ' than the last time',
                "ATLT": ' as the last time'
            }
        }
    }
};

var expanderOpenedHeight = mobile == "IOS" ? "calc(83vh - 65px)" : "calc(90vh - 65px)";

var current_page = "selection";
var color = null; var mid_color = null; var light_color = null;



$(document).ready(function(){
    addIMG = $("#addIMG").attr('src');
    binIMG = $("#binIMG").attr('src');
    editIMG = $("#editIMG").attr('src');
    grabIMG = $("#grabIMG").attr('src');
    pauseIMG = $("#pauseIMG").attr('src');
    playIMG = $("#playIMG").attr('src');
    sound_fullIMG = $("#sound_fullIMG").attr('src');
    sound_midIMG = $("#sound_midIMG").attr('src');
    sound_lowIMG = $("#sound_lowIMG").attr('src');
    sound_offIMG = $("#sound_offIMG").attr('src');
    timer2IMG = $("#timer2IMG").attr('src');
    tickIMG = $("#tickIMG").attr('src');
    arrowIMG = $("#arrowIMG").attr('src');

    $("img").attr("draggable", false);
});//readyEnd
