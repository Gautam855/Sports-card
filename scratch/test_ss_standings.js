
const key = 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623';
const host = 'sportscore6.p.rapidapi.com';

async function testStandings() {
    const url = `https://${host}/api/widget/standings/?sport=basketball&slug=nba`;
    const res = await fetch(url, {
        headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

testStandings();
