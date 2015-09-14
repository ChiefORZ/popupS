        module.exports = {
            buttons: {
                holder: "<nav class=\""+options.baseClassName+"-buttons "+ options.addClassName.buttonHolder +"\">{{buttons}}</nav>",
                submit: "<button type=\"submit\" class=\""+options.baseClassName+"-button-ok "+ options.addClassName.buttonOk +"\" id=\"popupS-button-ok\">{{ok}}</button>",
                ok:     "<button class=\""+options.baseClassName+"-button-ok "+ options.addClassName.buttonOk +"\" id=\"popupS-button-ok\">{{ok}}</button>",
                cancel: "<button class=\""+options.baseClassName+"-button-cancel "+ options.addClassName.buttonCancel +"\" id=\"popupS-button-cancel\">{{cancel}}</button>"
            },
            input : "<div class=\""+options.baseClassName+"-form "+ options.addClassName.form +"\">{{placeholder}}<input type=\"text\" id=\"popupS-input\" /></div>"
        };
