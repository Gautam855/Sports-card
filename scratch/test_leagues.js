
const key = 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623';
const host = 'allsportsapi2.p.rapidapi.com';

async function testLeague(tournamentId, seasonId, name) {
    const url = `https://${host}/api/tournament/${tournamentId}/season/${seasonId}/standings/total`;
    console.log(`Testing ${name} (${tournamentId})...`);
    try {
        const res = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': key,
                'X-RapidAPI-Host': host
            }
        });
        if (res.ok) {
            const data = await res.json();
            if (data?.standings?.[0]?.rows) {
                console.log(`✅ ${name} found! ${data.standings[0].rows.length} teams.`);
                return true;
            }
        }
        console.log(`❌ ${name} failed: ${res.status}`);
    } catch (e) {
        console.log(`❌ ${name} error: ${e.message}`);
    }
    return false;
}

// NBA: 132, 65360
// EuroLeague: 156, 65166 (Guess)
// Liga ACB (Spain): 137, 65355 (Guess)

testLeague(156, 65166, 'EuroLeague');
testLeague(137, 65355, 'Liga ACB');
testLeague(132, 65360, 'NBA');
