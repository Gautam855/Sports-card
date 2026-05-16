
const key = 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623';
const host = 'allsportsapi2.p.rapidapi.com';

async function findSeason(tournamentId) {
    console.log(`Searching for ${tournamentId}...`);
    // Try a few common season IDs
    const seasons = [65360, 65166, 65355, 65165, 65354, 54295, 54294];
    for (const sid of seasons) {
        const url = `https://${host}/api/tournament/${tournamentId}/season/${sid}/standings/total`;
        try {
            const res = await fetch(url, {
                headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host }
            });
            if (res.ok) {
                const data = await res.json();
                if (data?.standings?.[0]?.rows) {
                    console.log(`✅ Found! Tournament ${tournamentId}, Season ${sid}: ${data.standings[0].rows.length} teams.`);
                    return { tournamentId, seasonId: sid };
                }
            }
        } catch (e) {}
    }
    return null;
}

async function main() {
    await findSeason(156); // EuroLeague
    await findSeason(137); // ACB
    await findSeason(132); // NBA
    await findSeason(174); // France
}

main();
