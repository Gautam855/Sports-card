
const key = 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623';
const host = 'sportscore6.p.rapidapi.com';

async function test(slug) {
    const url = `https://${host}/api/widget/standings/?sport=basketball&slug=${slug}`;
    const res = await fetch(url, { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host } });
    const data = await res.json();
    if (data.standings) console.log(`✅ ${slug} found!`);
    else console.log(`❌ ${slug} failed: ${data.error || 'No standings'}`);
}

test('national-basketball-association');
test('nba');
test('wnba');
test('euroleague');
