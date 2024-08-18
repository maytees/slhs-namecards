import { parse } from "jsr:@std/csv";

function isFinished(grade: string) {
    const promptFinished = prompt(
        "This grade is finished, are you sure? (y/n): ",
    );

    if (promptFinished === "y") {
        return true;
    } else if (promptFinished === "n") {
        return false;
    } else {
        console.error("Invalid input. Try again.");
        return isFinished(grade);
    }
}

async function main() {
    const grade = prompt("What grade? (12) (9, 10 and 11 are finished): ");

    let filename: string | null = null;
    const activitiesFilename = "activities.csv";
    while (filename === null) {
        if (grade === "9") {
            if (!isFinished(grade)) {
                console.log("Exiting...");
                Deno.exit(1);
            }
            filename = "gradenine.csv";
        } else if (grade === "10") {
            if (!isFinished(grade)) {
                console.log("Exiting...");
                Deno.exit(1);
            }
            filename = "gradeten.csv";
        } else if (grade === "11") {
            if (!isFinished(grade)) {
                console.log("Exitting...");
                Deno.exit(1);
            }
            filename = "gradeeleven.csv";
        } else if (grade === "12") {
            filename = "gradetwelve.csv";
        } else {
            console.error(
                "Invalid grade. Exitting (Because too lazy to retry!).",
            );
            Deno.exit(1);
        }
    }

    const letterPrompt = prompt("What letter are you looking for?");
    if (!letterPrompt) {
        console.error("Invalid input. Try again.");
        main();
        return;
    }

    if (letterPrompt.length > 1) {
        console.error("Invalid input. Try again.");
        main();
        return;
    }

    const letter = letterPrompt.toLowerCase();
    let discardedAmount = 0;
    const discardedCodes = [] as { name: string; index: number }[];

    const f = await Deno.readTextFile(filename!);

    let expectedAmountSuccessful = false;

    while (!expectedAmountSuccessful) {
        const expectedAmount = Number(
            prompt("How many cards are you expecting? (enter number)"),
        );

        if (isNaN(expectedAmount)) {
            console.error("Invalid input. Try again.");
            continue;
        }

        const confirm = prompt(
            `You entered ${expectedAmount}. Is this correct? (y/n): `,
        );

        if (confirm === "y") {
            expectedAmountSuccessful = true;
        }

        if (confirm === "n") {
            console.error("Restarting...");
            continue;
        }

        if (confirm !== "y" && confirm !== "n") {
            console.error("Invalid input. Try again.");

            continue;
        }

        console.log("\nWaiting for scans. Type DONE to finish");
        let done = false;
        const codes: string[] = [];
        while (!done) {
            const code: string | null = prompt("Enter a barcode: ");
            if (!code) {
                continue;
            }

            if (codes.includes(code)) {
                console.log("Code already scanned. Skipping");
                continue;
            }

            if (code.toLowerCase() === "done" || code.toLowerCase() === "'") {
                if (
                    codes.length - 1 !==
                        expectedAmount - discardedAmount
                ) {
                    console.error(
                        `Expected ${
                            expectedAmount - discardedAmount
                        } codes, but got ${codes.length - 1}
                         ${
                            discardedAmount !== 0
                                ? `with ${discardedAmount} discarded`
                                : ""
                        }
                         `,
                    );
                    const confirm = prompt(
                        "Are you sure you want to finish? (y/n): ",
                    );
                    if (confirm?.toLowerCase() === "y") {
                        done = true;
                    } else {
                        continue;
                    }
                }
                done = true;
            } else {
                codes.push(code);
            }
        }

        console.log("\nFinished Grabbing Codes:");
        for (const code of codes) {
            console.log(code);
        }

        const csv = parse(f, { skipFirstRow: true });
        console.log("\nSearching for codes");

        // Array to store found students with their original index
        const foundStudents: {
            name: string;
            index: number;
            activity?: string;
        }[] = [];

        for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            let found = false;
            for (const row of csv) {
                if (
                    row["Student ID"] &&
                    row["Student ID"].trim() === code.trim()
                ) {
                    const name = row["Student Name"];
                    console.log(
                        `Found ${code} for student ${name}`,
                    );
                    if (name[0].toLowerCase() !== letter) {
                        console.log(
                            `%cDiscarding ${code} for student ${name}`,
                            "color: red",
                        );
                        discardedAmount++;
                        discardedCodes.push({
                            name,
                            index: i,
                        });
                        found = true;
                        break;
                    }
                    foundStudents.push({ name: row["Student Name"], index: i });
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log(`Could not find ${code}`);
                const lastName = prompt(
                    `Enter the last name for code ${code} (Number ${i}): `,
                );
                if (lastName) {
                    foundStudents.push({ name: lastName, index: i });
                }
            }
        }

        console.log("\n\nFinished");

        // Sort foundStudents alphabetically by name
        foundStudents.sort((a, b) => a.name.localeCompare(b.name)).reverse();

        // Create the string of indexes
        const indexString = foundStudents.map((student) => student.index).join(
            ", ",
        );

        console.log(
            "\n\n%cIndexes in alphabetical order, this is the order the stack would look as:\n",
            "color: green",
        );
        for (const student of foundStudents.reverse()) {
            console.log(
                `Index: %c(${student.index}) - Name: %c${student.name}`,
                "color: blue",
                "color: white",
            );
        }

        console.log(
            "\nIndexes in alphabetical order:\n%c" + indexString,
            "color: green",
        );
        for (const card of discardedCodes) {
            console.log(
                `%cDiscarded Code: Name: %c${card.name} - %cIndex: %c${card.index}`,
                "color: red",
                "color: blue",
                "color: red",
                "color: blue",
            );
        }

        const restart = prompt("Would you like to restart? (y/n): ");
        if (restart?.toLowerCase() === "y") {
            console.log("Restarting...");
            main();
        } else {
            console.log("Exiting...");
            Deno.exit(1);
        }
    }
}

main().catch(console.error);
