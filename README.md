# SLHS Namecards

> [!WARNING]  
> Commit history only has a few commits becauase I had to delete the `.git` folder and recreate the repo. Apologies for that.

*This project wont be touched for probably the next year, as it is for pre-school year prep*

Gives back the order in which to order business cards based on scanned barcodes (studnet id's), by referencing csv files.
Contains helpful debugging information, and safegaurds.

## Instructions

1. Lay out sticky notes, index cards, or something else, labeled starting from 0 to whatever the max amount of students a grade 
contains with a certain first letter (last name), doens't have to be specific.

2. Run via deno cli or executable & answer questions asked by the script.

3. Start scanning the barcodes in order from 0.

4. After finishing the scans, type `done`.

5. Start picking up the cards in order, bottom to top. 

Then you have an alphabetically sorted stack of business cards of a certain grade of a certain first letter (last name)

## Safegaurds

The script has some safegaurds and debugging tools.

### Expected Count

Enter in the number which the last card is on, in cases where you might've scanned too many cards, the script will
let you know, before continuing.

### Discarding Cards

In cases where you might've accidentally mixed different letters, the script will automatically remove the cards, also letting
you know.

### Manual input

In cases where a scanned barcode isn't in the spreadsheet, most likely because the studnet had moved to the school
*after* the spreadsheet was last updated, the script will ask for manual input of the last name.

