const express = require('express');
const app = express();

const {Datastore} = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

const datastore = new Datastore();

const BOAT = "Boat";

const SLIP = "Slip";

const router = express.Router();

app.use(bodyParser.json());

function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}

/* ------------- Begin Model Functions ------------- */
/* ----------- Boats -----------*/
function post_boat(name, type, length){
    var key = datastore.key(BOAT);
	const new_boat = {"name": name, "type": type, "length": length};
	return datastore.save({"key":key, "data":new_boat}).then(() => {return key});
}

function patch_boat(id, name, type, length){
    const key = datastore.key([BOAT, parseInt(id,10)]);
    const boat = {"name": name, "type": type, "length": length};
    return datastore.update({"key":key, "data":boat}).then(() => {return key});
}

function get_boats(){
	const q = datastore.createQuery(BOAT);
	return datastore.runQuery(q).then( (entities) => {
			return entities[0].map(fromDatastore);
		});
}

function get_slips(){
	const q = datastore.createQuery(SLIP);
	return datastore.runQuery(q).then( (entities) => {
			return entities[0].map(fromDatastore);
		});
}

function post_slip(number){
    var key = datastore.key(SLIP);
	const new_slip = {"number": number, "current_boat": null};
	return datastore.save({"key":key, "data":new_slip}).then(() => {return key});
}

function boatArrives(slipID, boatID)
{
    var key = datastore.key([BOAT, parseInt(slipID,10)]);
	const new_slip = {"number": number, "current_boat": boatID};
	return datastore.save({"key":key, "data":new_slip}).then(() => {return key});
}

/*-------Universals---------*/
function get_entities(type){
	const q = datastore.createQuery(type);
	return datastore.runQuery(q).then( (entities) => {
			return entities[0].map(fromDatastore);
		});
}

function delete_entity(id, type){
    const key = datastore.key([type, parseInt(id,10)]);
    return datastore.delete(key); 
}

function get_entity(id, type)
{
    const key = datastore.key([type, parseInt(id,10)]);
    return datastore.get(key);
}

function createJSONResp(array, req, idAdd)
{
    var myJSON = array[0];
    selfAdd = req.protocol + '://' + req.get('host') + req.path + '/';
    myJSON.id = idAdd;
    myJSON.self = selfAdd;
    return myJSON;
}

function createJSONRespArray(array, req)
{
    var myJSON = [];
    selfAdd = req.protocol + '://' + req.get('host') + req.originalUrl + '/';
    for(i = 0; i < array.length; i++)
    {
        myJSON[i] = array[i];
        myJSON[i].self = selfAdd + myJSON[i].id;
    }
    return myJSON;
}

function check_entity(id, type)
{
    var retVal = 0;
    const key = datastore.key([type, parseInt(id,10)]);
    const entity = datastore.get(key);
    if(entity[0] == null)
    {
        retVal = 1;
    }
    else

    return (retVal);
}


function slipBoatCheck(slip_id, boat_id)
{
    var retVal = check_entity(slip_id, SLIP);
    retVal = check_entity(boat_id, boat)

    return retVal;
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

/* -------Boats------ */

router.get('/boats/', function(req, res){
    const boats = get_boats()
	.then( (boats) => {
        res.status(200).json(createJSONRespArray(boats, req));
    });
});

router.post('/boats/', function(req, res){
	if(req.body.name == null || req.body.type == null || req.body.length == null)
    {
		res.status(400).send('{ "Error":  "The request object is missing at least one of the required attribute" }')
    }
   else
    {
        post_boat(req.body.name, req.body.type, req.body.length)
        .then( key => {
            const boat = get_entity(key.id, BOAT).then( (boat) => {
                res.status(201).json(createJSONResp(boat, req, key.id));
            });
        });
    }
});

router.patch('/boats/:id', function(req, res){
    if(req.body.name == null || req.body.type == null || req.body.length == null)
    {
		res.status(400).json({Error:  "The request object is missing at least one of the required attribute"})
    }
    else
    {
        patch_boat(req.params.id, req.body.name, req.body.type, req.body.length)
        .then(key => {
            const boat = get_entities(key.id, BOAT).then( (boat) => {
                self = req.protocol + '://' + req.get('host') + req.baseUrl + '/' + key.id;
                res.status(200).json(createJSONResp(boat, req, key.id));
            });
        });
    }
});

router.get('/boats/:id', function(req, res){
    const boat = get_entity(req.params.id, BOAT).then( (boat) => {
        if(boat[0] == null)
        {
            res.status(404).json({Error:  "No boat with this boat_id exists"});
        }
        else
        {
            res.status(200).json(createJSONResp(boat, req, req.params.id));
        }
    } );
});

router.delete('/boats/:id', function(req, res){
    const boat = get_entity(req.params.id, BOAT).then( (boat) => {
    if(boat[0] == null)
    {
        res.status(404).json({Error:  "No boat with this boat_id exists"});
    }
    else
    {
        delete_entity(req.params.id, BOAT).then(res.status(204).end());
    }
    });
});

/*-------------slips ------------ */
router.get('/slips/', function(req, res){
    const slips = get_slips()
	.then( (slips) => {
        res.status(200).json(createJSONRespArray(slips, req));
    });
});

router.post('/slips/', function(req, res){
	if(req.body.number == null)
    {
		res.status(400).send('{ "Error":  "The request object is missing at least one of the required attribute" }')
    }
   else
    {
        post_slip(req.body.number)
        .then( key => {
            const slip = get_entity(key.id, SLIP).then( (slip) => {
                res.status(201).json(createJSONResp(slip, req, key.id));
            });
        });
    }
});

router.delete('/slips/:id', function(req, res){
    const slip = get_entity(req.params.id, SLIP).then( (slip) => {
    if(slip[0] == null)
    {
        res.status(404).json({Error:  "No slip with this slip_id exists"});
    }
    else
    {
        delete_entity(req.params.id, SLIP).then(res.status(204).end());
    }
    });
});

router.get('/slips/:slip_id', function(req, res){
    const slip = get_entity(req.params.slip_id, SLIP).then( (slip) => {
        if(slip[0] == null)
        {
            res.status(404).json({Error:  "No slip with this slip_id exists"});
        }
        else
        {
            res.status(200).json(createJSONResp(slip, req, req.params.slip_id));
        }
    } );
});

/* ------------- End Controller Functions ------------- */

app.use('/', router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening to 90's R&B on port ${PORT}...`);
});