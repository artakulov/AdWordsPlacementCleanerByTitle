// Copyright 2017, Lira ltd. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @name AdWords GDN Placement Cleaner For Impressions (Report) script
 *
 * @overview The script allows you to manage Google Display Network
 *     GDN placements and remove common non effective placements about
 *     games, recipes, films, etc
 *     See
 *     https://lira.agency/
 *     for more details.
 *
 * @author Artem Akulov [help@lira.agency]
 *
 * @version 1.0
 *
 * @changelog
 * - version 1.0
 *   - Released initial version.
 */

//Set Negative Placement list in Shared library for script`s results. 
//If list in not exist script create a list with that name
var EXCLUDED_PLACEMENT_LIST_NAME = 'PlacementCleanerByTitleList';

// The spreadsheet for parse GDN titles. This should be a copy of
// https://docs.google.com/spreadsheets/d/1IawBXlLeBsYBi9A45HQadTlACEgtMhY4jG7nw773hII/edit?usp=sharing

var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1r0WMGA-vJaa8iH7gEd9IjPiKOwovepyQ7QI5fSItNM4/edit?usp=sharing';
//Get Data with Placement`s Titles
var ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL);  
var urlTitles = getSheetData(ss, 0);
//Massive on negative templates which will be compared with parsed GDN placement`s Titles.
var badWords = getSheetData(ss, 1);

function main() {
  var excludePlacementArray = [];
  for (var i = 0; i < urlTitles.length; i++) {
    if (containsAny(urlTitles[i][1].toLowerCase(), badWords)) {
      excludePlacementArray[excludePlacementArray.length] = urlTitles[i][0].toString();
    }
  }
  Logger.log(excludePlacementArray);//In Log you will see a result list of new excluded placements
  addNegativeKeywordToList(excludePlacementArray);
}
function getSheetData(ss, sheetIndex) {
  var sheet = ss.getSheets()[sheetIndex];
  var range = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  return range.getValues();
}
function containsAny(str, substrings) {
 for (var i = 0; i != substrings.length; i++) {
   var substring = substrings[i];
   if (str.indexOf(substring) != - 1 && str.indexOf('mobileapp::') == -1) {
     return substring;
   }
  }
 return null; 
}
function addNegativeKeywordToList(negativePlacements) {
 var excludedPlacementListIterator =
 AdWordsApp.excludedPlacementLists().withCondition("Name = '" + EXCLUDED_PLACEMENT_LIST_NAME + "'").get();
 
 if (excludedPlacementListIterator.totalNumEntities() == 1) {
 var excludedPlacementList = excludedPlacementListIterator.next().addExcludedPlacements(negativePlacements);
 } else {
 AdWordsApp.newExcludedPlacementListBuilder()
 .withName(EXCLUDED_PLACEMENT_LIST_NAME)
 .build().getResult().addExcludedPlacements(negativePlacements);
 }
}