
const key = 'c619ab77bemsh26aba9b263640c6p16d04cjsn2ccf469c9623';
const host = 'allsportsapi2.p.rapidapi.com';

async function getCategories() {
    const url = `https://${host}/api/sport/basketball/categories`;
    const res = await fetch(url, {
        headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

getCategories();
