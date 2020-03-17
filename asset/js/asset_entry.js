import generateUI from "./asset_ui";
import jQuery from "jquery";
window.jQuery = jQuery;

import {
  ckan_server,
  changeCurrentLanguage,
  changeCurrentCKAN,
  setTimeFilters,
  setVerticalFilters,
  generateFilterCategories,
  generateLocationCategories
} from "./asset";

import i18nStrings from "./asset_i18n";
import { initMapFromConfig } from "./asset_ol";

import uiStrJSON from "../resources/ui_str.json";
import mapJSON from "../resources/map.json";
import ckanJSON from "../resources/ckan.json";
import locationsJSON from "../resources/locations.json";

function buildMap(ckanServerOptions) {
  let urlParams = new URLSearchParams(window.location.search);
  let curlng = urlParams.get("lg");
  if (curlng === "fr" || curlng == "en") {
    i18nStrings.setBaseLanguage(curlng);
    i18nStrings.setCurrentLanguage(curlng);
    ckan_server.setCurrentLanguage(curlng);
  }

  i18nStrings.setUIStrings(uiStrJSON);
  initMapFromConfig(mapJSON);
  ckan_server.loadConfig(ckanServerOptions || ckanJSON);
  generateFilterCategories();
  generateLocationCategories(locationsJSON);

  generateUI();
}

function callChangeLanguage() {
  var newl = jQuery("#language option:selected").val();
  changeCurrentLanguage(newl);
}

function callChangeCKAN() {
  let newckan = jQuery("#ckan_instance option:selected").val();
  if (newckan === "opencanada") {
    changeCurrentCKAN("opendataca.json");
  } else if (newckan === "slgo") {
    changeCurrentCKAN("slgo_ckan.json");
  } else if (newckan === "ioos") {
    changeCurrentCKAN("ioos_ckan.json");
  } else if (newckan === "Nextgeoss") {
    changeCurrentCKAN("nextgeoss_ckan.json");
  } else if (newckan === "pacific") {
    changeCurrentCKAN("cioos_pacific_ckan.json");
  } else if (newckan === "national") {
    changeCurrentCKAN("national_ckan.json");
  } else if (newckan === "atlantic") {
    changeCurrentCKAN("cioos_atlantic_ckan.json");
  }
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
  buildMap,
  jQuery,
  callChangeLanguage,
  callChangeCKAN,
  changeTimeFilters,
  clearTimeFilters,
  changeVerticalFilters,
  clearVerticalFilters
};
