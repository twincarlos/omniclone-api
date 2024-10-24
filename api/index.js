import dotenv from 'dotenv';
import express from 'express';
import FireCrawlApp from '@mendable/firecrawl-js';
import parse from '../parse.js';

dotenv.config();

const app = express()

app.get('/api/usatt/player-lookup/:keyword', async (req, res) => {
    const { keyword } = req.params;
    const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
    const firecrawl = new FireCrawlApp({ apiKey: FIRECRAWL_API_KEY });
    const scrapeResult = await firecrawl.scrapeUrl(`https://usatt.simplycompete.com/userAccount/s2?citizenship=&gamesEligibility=&gender=&minAge=&maxAge=&minTrnRating=&maxTrnRating=&minLeagueRating=&maxLeagueRating=&state=&region=Any+Region&favorites=&q=${keyword}&displayColumns=First+Name&displayColumns=Last+Name&displayColumns=USATT%23&displayColumns=Location&displayColumns=Home+Club&displayColumns=Tournament+Rating&pageSize=1000`, {
        formats: ["markdown"],
        onlyMainContent: true,
        includeTags: ["td"]
    });
    const parsedText = parse(scrapeResult.markdown);
    return res.json(parsedText);
})

app.listen(3000, () => console.log(`Example app listening on port ${3000}`));