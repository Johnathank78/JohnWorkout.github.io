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
            "timeSpent" : "Temps en s�ance",
            "workedTime" : "Temps sous tension",
            "weightLifted" : "Charge soulev�e",
            "repsDone" : "R�p�titions effectu�es",
            "since" : "Depuis le",
        },
        "preferences": {
            "preferences": "Param�tres",
            "language": "Langue",
            "weightUnit": "Unit� de charge",
            "notifBefore": "Avance notification",
            "keepHistory": "Garder l'historique",
            "forEver" : "Toujours",
            "sDays" : "7 Jours",
            "oMonth" : "1 Mois",
            "tMonth" : "3 Mois",
            "sMonth" : "6 Mois",
            "oYear" : "1 An",
            "keepAwake": "Toujours allum�",
            "autoSaver": "Economiseur auto",
            "export": "Exporter",
            "import": "Importer",
            "impExpMenu": {
                "selectElements": "Choisissez",
                "sessionList": "Seances",
                "reminderList": "Rappels",
                "preferences": "Param�tres",
                "stats": "Statistiques",
                "emptyMessage": "Aucun �l�ment sauvegard�"
            }
        },
        "calendar": {
            "forWard": "Avant",
            "backWard": "Arri�re",
            "shiftByOne": "D�caler d'un jour",
            "emptyMessage": "Aucune s�ance programm�e"
        },
        "recovery": {
            "recovery": "Sauvegarde",
            "subText2": " s'est arr�t� de mani�re inattendue, reprendre ?",
            "no": "Non",
            "yes": "Oui",
        },
        "sessionItem": {
            "schedule": "Programmer",
            "history": "Historique",
            "addASession": "Cr�er une s�ance"
        },
        "updatePage": {
            "name": "Nom",
            "reminderBody": "Corps du Rappel",
            "on": "A partir de",
            "at": "A",
            "every": "Tout les",
            "create": "Cr�er",
            "update": "Actualiser",
            "delete": "Supprimer",
            "add": "Ajouter",
            "schedule": "Programmer",
            "break": "Pause",
            "cycle": "Cycle",
            "work": "Travail",
            "rest": "Repos",
            "emptyHistory": "Pas encore d'historique",
            "disabledHistory": "L'historique est d�sactiv�",
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
                "sets": "S�ries",
                "reps": "Reps",
                "rest": "Repos",
                "body": "Coprs",
                "hint": "Indication",
                "type": 'Type',
                "pause": "Pause"
            },
            "exerciseTypes": {
                "Bi." : "Bilat�ral",
                "Uni.": "Unilat�ral",
                "Int.": "Intervalle",
                "Wrm.": "Echauff",
                "Pause": 'Pause'
            }
        },
        "screenSaver": {
            "saver": "Economiseur",
        },
        "inSession": {
            "noMore": "Plus de s�ries",
            "start": "D�but",
            "rest": "Repos",
            "next": "Suivant",
            "last": "Dernier",
            "done": "Fini",
            "finished": "Terminer",
            "end": "Fin",
            "quit": "Quitter",
            "cancel": "Annuler",
            "exitQuestion": "Quitter la s�ance ?",
            "exitDetails": "Votre progression pourrait �tre perdue",
            "remaining": {
                "reSets": "S�ries restantes",
                "reReps": "R�p�titions restantes",
                "reTime": "Temps restant",
                "reWoTime": "Temps travail restant",
                "reWeight": "Charge restante"
            },
        },
        "inIntervall": {
            "getReady": "Pr�paration",
            "work": "Travail",
            "rest": "Repos",
            "end": "Fin",
        },
        "notification": {
            "duration": "Dur�e",
            "restOver": "Repos termin�",
            "workOver": "Travail termin�",
            "xRestOver": "Repos extra termin�",
            "breakOver": "Pause termin�e"
        },
        "error": {
            "updatePage": {
                "nameAlreadyUsed": "Nom d�j� utilis�",
                "fillAllEntries": "Remplissez toutes les entr�es",
                "intNumericOnly": "Cycle et Travail doivent �tre num�rique",
                "restTimeOnly": "Repos doit �tre temporel",
                "restGreater": "Repos doit �tre sup�rieur � 4s",
                "workGreater": "Travail doit �tre sup�rieur � 5s",
                "workRestTooBig": "Travail ou Repos bien trop grand",
                "totalTooBig": "Temps total bien trop grand",
                "cycleMinimum" : "Il doit y avoir minimum 1 cycle",
                "noComma": "Le nom ne peut pas contenir de virgule",
                "workNumericOnly": "S�rie, R�p�titon et Poids doivent �tre num�rique",
                "zeroSet": "Il ne peut pas y avoir 0 s�rie",
                "zeroRep": "Il ne peut pas y avoir 0 r�p�tition",
                "weightNumeric": 'Poids doit �tre num�rique',
                "goToSleep": "Tu peux �galement faire une sieste",
                "breakNumeric": "Pause doit �tre temporel",
                "consecutiveBreak": "Les pauses cons�cutives ne servent � rien",
                "zeroBreak": "Pause trop petite"
            },
            "schedule": {
                "hoursMinNumeric": "Heure, Minute et Nombre doivent �tre num�rique",
                "greatherHours": "Heure ne peut pas �tre sup�rieur � 23",
                "greaterMinutes": "Minute ne peut pas �tre sup�rieur � 59",
                "timePassed": "Le temps est d�j� pass�",
                "notScheduled": "Cette s�ance n'est pas encore programm�e"
            },
            "parameters": {
                "notifTime": "Avance doit �tre temporelle",
                "notifTooLarge": "Avance trop grande",
                'notifTooSmall': "Avance trop petite"
            }
        },
        "bottomNotif": {
            "scheduled": "programm�e",
            "unscheduled": "d�programm�",
            "created": "cr�e",
            "deleted": "supprim�",
            "updated": "mis � jour",
            "IOprefix": "Donn�es",
            "imported": "import�es avec succ�s",
            "exported": "export�es avec succ�s",
            "parameters": "mis � jour",
            "read": "Permission de lecture refus�e",
            "write": "Permission d'�criture refus�e",
            "audioBroken": "Contr�le du son non disponible"
        },
        "sessionEnd": {
            "mainText": {
                "congrats": "F�licitation !",
                "failed": "Quel �chec !",
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
                        "1": "Plut�t banal",
                        "2": "Pas mal !"
                    },
                    "bad": {
                        "0": "Tu te sens faible ?",
                        "1": "Pense � te reposer",
                        "2": "La prochaine !"
                    }
                },
            },
            "subText": {
                "failed": {
                    "0": "Fr�rot, ne l�che pas comme �a, tu en avais encore !",
                    "1": "H�, tu as d�j� fais beaucoup mieux, baisse pas les bras !",
                    "2": "Continue � pousser, l'�chec n'est qu'une �tape vers le succ�s !",
                    "3": "Tu as tr�buch�, mais ce n'est pas la fin, rel�ve-toi plus fort !",
                    "4": "L'�chec est temporaire, rel�ve-toi et essaie � nouveau !",
                    "5": "C'est un revers, pas une d�faite, continue � progresser !"
                },
                "congrats": {
                    "YC": "Tu as compl�t� ",
                    "FT": " pour la ",
                    "T": " fois"
                },
                "chrono": {
                    "YHB": "Tu as �t� ",
                    "YT": "Tu as pris "
                },
                "weight":{
                    "YHL": "Tu as soulev� ",
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
                    "less": "% plus l�ger",
                    "even": "autant"
                }
            },
            "common": {
                "TTLT": ' que la fois derni�re',
                "ATLT": ' que la fois derni�re'
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
