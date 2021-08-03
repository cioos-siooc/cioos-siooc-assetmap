import generateUI from "./asset_ui";
import jQuery from "jquery";
window.jQuery = jQuery;

import {
  updateHeaderLanguage,
  changeCurrentLanguage,
  setTimeFilters,
  setVerticalFilters,
  generateFilterCategories,
  generateLocationCategories
} from "./asset";

import i18nStrings from "./asset_i18n";
import {CKANServer} from "./asset_ckan";
import { initMapFromConfig, changeBackgrounLayer} from "./asset_ol";

import uiStrJSON from "../resources/ui_str.json";
import mapJSON from "../resources/map.json";
import locationsJSON from "../resources/locations.json";

var ckan_server;

function buildMap(ckanServerOptions) {
  ckan_server=new CKANServer(ckanServerOptions);

  let urlParams = new URLSearchParams(window.location.search);
  let curlng = urlParams.get("lg");
  if ( !(curlng === 'fr') && !(curlng === 'en'))
  {
      let userLang = navigator.language || navigator.userLanguage; 
      if ( userLang.includes('fr') )
      {
          curlng = "fr";
      }
      else if ( userLang.includes('en') )
      {
          curlng = "en";
      }
      else
      {
          // unknown
          curlng = "en";
      }
  }
  i18nStrings.setBaseLanguage(curlng);
  i18nStrings.setCurrentLanguage(curlng);
  ckan_server.setCurrentLanguage(curlng);
  updateHeaderLanguage(curlng);
  
  i18nStrings.setUIStrings(uiStrJSON);
  initMapFromConfig(mapJSON);
  generateFilterCategories();
  generateLocationCategories(locationsJSON);
  
  generateUI();
  changeBackgrounLayer(ckanServerOptions.start_layer || 'bathy');
  return ckan_server;
}

function callChangeLanguage() {
  var newl = jQuery("#language option:selected").val();
  changeCurrentLanguage(newl);
}

function changeTimeFilters() {
  let minvalue = jQuery("#debug_date_min").val();
  let maxalue = jQuery("#debug_date_max").val();
  setTimeFilters(minvalue, maxalue);
}

function clearTimeFilters() {
  jQuery("#debug_date_min").val("");
  jQuery("#debug_date_max").val("");
  setTimeFilters(undefined, undefined);
}

function changeVerticalFilters() {
  let minvalue = jQuery("#debug_vertical_min").val();
  let maxalue = jQuery("#debug_vertical_max").val();
  setVerticalFilters(minvalue, maxalue);
}

function clearVerticalFilters() {
  jQuery("#debug_vertical_min").val("");
  jQuery("#debug_vertical_max").val("");
  setVerticalFilters(undefined, undefined);
}

export {
  ckan_server,
  buildMap,
  jQuery,
  callChangeLanguage,
  changeTimeFilters,
  clearTimeFilters,
  changeVerticalFilters,
  clearVerticalFilters
};
