
const key = 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623';
const host = 'sportscore6.p.rapidapi.com';

async function testSportScore() {
    const url = `https://${host}/api/widget/matches/?sport=basketball&limit=5`;
    const res = await fetch(url, {
        headers: {
            'X-RapidAPI-Key': key,
            'X-RapidAPI-Host': host
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

testSportScore();
