import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 4000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "databases",
    password: "Somasai%12",
    port: 5432,
});

const out = [];
const inid = [];
let first_quote = [];
const  deletedquote=[{ message: "" }];
const update=[{quoteu:""}];


db.connect();

app.get("/", async (req, res) => {
    try {
        const result = await axios.get("https://date.nager.at/api/v3/AvailableCountries");
        console.log(result);

        res.render("quote.ejs", { resu: result.data,update:update,inid: inid, deletedquote: deletedquote[0].message,out: out, detail: "shhshsg", first_quote: first_quote });
    } catch (error) {
        console.error(error);
    }
});

app.post("/generatequote", async (req, res) => {
    try {
        const selectedCountryCode = req.body.ccode;
        console.log(selectedCountryCode);

        const result = await axios.get("https://api.breakingbadquotes.xyz/v1/quotes");

        console.log(result);
        first_quote.push(result.data); 
        res.redirect("/");
    } catch (error) {
        console.error(error);
    }
});

    app.post("/addquote", async (req, res) => {
        try {
            const userquote = req.body.quoten;
    
            await db.query("INSERT INTO quotes (quote) VALUES ($1)", [userquote]);
            const finalquote = await db.query("SELECT quote, id FROM quotes ORDER BY id DESC LIMIT 1");
    
            out.push({ quote: finalquote.rows[0].quote, id: finalquote.rows[0].id });
    
            res.redirect("/");
    
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    });
    app.post("/searchquote", async (req, res) => {
        try {
            const userid = req.body.quoteid;
    
          
            const quotebyid = await db.query("SELECT quote FROM quotes WHERE id= ($1)", [userid]);
        
            inid.push({ quoteid: quotebyid.rows[0].quote });
          
    
            res.redirect("/");
        } catch (error) {
            console.error(error);
            res.status(500).send("sorry searched quote is deleted");
        }
    });
    app.post("/update", async (req, res) => {
        try {
            const useruq = req.body.updatequote;
            const useruid = req.body.updateid;

    
            await db.query("UPDATE quotes SET quote = $1 WHERE id = $2", [useruq, useruid]);
            const uquote =await db.query("SELECT quote FROM quotes WHERE id=($1)",[useruid])
            update.push({ quoteu: uquote.rows[0].quote });
          
    
            res.redirect("/");
        } catch (error) {
            console.error(error);
            res.status(500).send("sorry the  quote  you want to update  is deleted");
        }
    });
app.post("/delete", async (req, res) => {
    try {
        const deleteId = req.body.delete;


        await db.query("DELETE FROM quotes WHERE id= ($1)", [deleteId]);
         const delquote=await db.query("SELECT quote FROM quotes WHERE id=($1)", [deleteId]);

        deletedquote[0].message =" Your quote is deleted:Trying searching for it.";

   
        res.redirect("/");
    } catch (error) {
        console.error(error);
    }
});
app.listen(port, () =>{
    console.log("listenng to port ${port} ");
});