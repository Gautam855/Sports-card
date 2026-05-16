
const key = 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623';
const host = 'allsportsapi2.p.rapidapi.com';

async function test(tid, sid, name) {
    const url = `https://${host}/api/tournament/${tid}/season/${sid}/standings/total`;
    const res = await fetch(url, { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host } });
    if (res.ok) {
        const d = await res.json();
        if (d.standings) console.log(`✅ ${name} works!`);
        else console.log(`❌ ${name} no standings`);
    } else console.log(`❌ ${name} failed ${res.status}`);
}

test(132, 65360, 'NBA');
test(156, 65166, 'EuroLeague');
test(136, 65361, 'NCAA');
test(137, 65355, 'Liga ACB');
