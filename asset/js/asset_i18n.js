function StringTranslator()
{
    this.ui_strings = undefined;
    this.baseLanguage = "fr";
    this.currentLanguage = "fr";

    this.setUIStrings = function(strings){
        this.ui_strings = strings;
    };

    // should have some kind of validation
    this.setCurrentLanguage = function(lg){
        this.currentLanguage = lg;
    };

    this.setBaseLanguage = function(lg){
        this.baseLanguage = lg;
    };

    this.getUIString = function(id) {
        ret_str = "i18n_error";
        if ( this.ui_strings[id][this.currentLanguage] !== undefined )
        {
            ret_str = this.ui_strings[id][this.currentLanguage];
        }
        else if ( this.ui_strings[id][this.baseLanguage] !== undefined )
        {
            ret_str = this.ui_strings[id][this.baseLanguage];
        }
        return ret_str;
    };
    

    this.getTranslation = function(i18nStrings){
        ret_str = "i18n_error";
        if ( i18nStrings[this.currentLanguage] !== undefined )
        {
            ret_str = i18nStrings[this.currentLanguage];
        }
        else if ( i18nStrings[this.baseLanguage] !== undefined )
        {
            ret_str = i18nStrings[this.baseLanguage];
        }
        return ret_str;
    };
}