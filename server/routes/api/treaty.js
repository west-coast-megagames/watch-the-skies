const routeDebugger = require('debug')('app:routes');
const express = require('express');
const router = express.Router();
const nexusEvent = require('../../startup/events');

const { Treaty } = require('../../models/dip/treaty');
const { logger } = require('../../middleware/winston'); // Import of winston for error logging
const { Team } = require('../../models/team/team');

// @route   GET api/treaties
// @Desc    Get all Treaties
// @access  Public
router.get('/', async function (req, res){
    routeDebugger('Showing all Treaties');
    let treaties = await Treaty.find().sort({ team: 1 });  
    res.status(200).json(treaties);
}); 

// @route   POST api/treaties
// @Desc    Post a new treaty
// @access  Public
//EXPECTATIONS: "creator": "<team ID>", "name": "<Anything the player wants the Treaty to be named>"
router.post('/', async function (req, res){
    let { creator } = req.body;    
    try{
        let treaties = new Treaty(req.body);    

        let creatorTeam = await Team.findById({_id: creator}); //populate creator's team so we can pass it back
        creator = creatorTeam;
        creator.treaties.push(treaties._id);
        creator = await creator.save();
        //nexusEvent.emit('updateTeam');
        treaties = await treaties.saveActivity(treaties, `Treaty Created By ${creator.name}`); 
        routeDebugger(treaties);
        res.status(200).json(treaties);        
    }
    catch (err) {
        logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
          meta: err,
        });
        res.status(400).send(`Error creating treaty: ${err}`);
      }//catch

});

// @route   PUT api/ratify
// @Desc    Ratify a treaty for your team
// @access  Public
//EXPECTATIONS: "treaty": {<Treaty Object>}, "ratifier": "<ID>"
//I am assuming that the person ratifying this treaty has access to it through witnessing, and am not handling any logic whether they 
//are allowed to sign treaty (through the 'excluded' array property of the Treaty Obj)
router.put('/ratify', async function (req, res){
    try{
        let { treaty, ratifier } = req.body;
        treaty = await Treaty.findById({_id: treaty._id});//populate treaty
        treaty.signatories.push(ratifier);
        ratifier = await Team.findById({_id: ratifier});
        ratifier.treaties.push(treaty._id);
        ratifier = await ratifier.save();

        treaty = await treaty.saveActivity(treaty, `Treaty Ratified By ${ratifier.name}`); 
        res.status(200).send(`Treaty Ratified By ${ratifier.name}!`);         
    }
    catch (err) {
        logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
          meta: err,
        });
        res.status(400).send(`Error ratifying treaty: ${err}`);
      }//catch
});

// @route   PUT api/modify
// @Desc    Modify a treaty 
// @access  Public
//EXPECTATIONS: "treaty": {<Treaty Object>}, "changes": [{"changeType": "name of change", data: "<W/E is changing>"}], "modifier": "<modifier team ID>"
/*"changes" methods and logic:
1) "name": replaces treaty's name with whatever "name" is paired with
2) "cost": replaces treaty's cost with whatever "cost" is paired with
3) "author": checks the treaties author array. if the changed author is not in the array, they will be 
    added, then will check and add them to witnesses if they are absent. Else if they are already 
    in the array, they will be removed from the authorship (but NOT from witness)
4) 
*/
router.put('/modify', async function (req, res){
    let { treaty, changes, modifier } = req.body;
    if (treaty.status.draft === false){
        res.status(400).send(`Cannot modify a treaty that is in the proposal state`);
    }
    try{
        treaty = await Treaty.findById({_id: treaty._id});//populate treaty
        modifier = await Team.findById({_id: modifier});
        for (let element of changes){
            switch(element.changeType){
                case "name"://change the name of the treaty
                    treaty.name = element.data;
                    break;
                case "cost"://adjust cost of treaty
                    treaty.cost = element.data;
                    break;
                case "author"://add authorship rights of this treaty for another team
                    let newAuthor = await Team.findById({_id: element.data});                
                    //step 1) check to see if author is being removed or added to treaty
                    if(!treaty.authors.includes(newAuthor._id)){//if the treaty does not have this author
                        treaty.authors.push(newAuthor._id); //add new author to treaty
                        if(!treaty.witness.includes(newAuthor._id)){
                            treaty.witness.push(newAuthor._id); //add new author to treaty's witness array
                        }
                        if (!newAuthor.treaties.includes(treaty._id)){//if the team treaty array does NOT have this treaty in it
                            newAuthor.treaties.push(treaty._id);
                        }                        
                    }//if the treaty does not have this author
                    else{
                        let x = treaty.authors.indexOf(newAuthor._id);
                        treaty.authors.splice(x, 1);//remove author from treaty array
                    }
                    newAuthor = await newAuthor.save();
                    break;
                case "witness"://allow other teams to view this treaty
                    let newWitness = await Team.findById({_id: element.data});   
                    if(!treaty.witness.includes(newWitness._id)){//if witness is not in the treaty array yet
                        treaty/witness.push(newWitness._id);
                        newWitness.treaties.push(treaty._id);
                    }
                    else{
                        let x = treaty.witness.indexOf(newWitness._id);
                        treaty.witness.splice(x, 1);//remove target from array
                    }

                    break;
                case "excluded"://block country from ratifying this treaty
                    
                    break;
                case "alliance"://add an alliance type to the treaty
                    
                    break;
                case "clauses"://change the clauses of the treaty
                    
                    break;
                case "violition"://change the violition of the treaty
                    
                    break;
                case "status"://modify any status of the treaty (from draft to proposal)
                    
                    break;
                
                
            }//switch
        }//for
        treaty = await treaty.saveActivity(treaty, `${changes.length} Elements of Treaty Modified `); 
        res.status(200).send(`${changes.length} Elements of Treaty Modified by ${modifier.name}`);  
    }
    catch (err) {
        logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
          meta: err,
        });
        res.status(400).send(`Error modifying treaty: ${err}`);
    }//catch
}); 

// @route   DELETE api/treaties
// @Desc    Delete all treaties
// @access  Public
router.delete('/', async function (req, res){

    let data = await Treaty.deleteMany();
    let teams = await Team.find();
    for (let team of teams){
        team.treaties = [];
        team.save();
    }
    res.status(200).send(`We killed ${data.deletedCount}`)    
});

// @route   DELETE api/treaties/id
// @Desc    Delete a specific treaty
// @access  Public
//EXPECTATIONS: The treaty itself (at least the ID and the status of the Treaty)
//This DELETE should only be called by the creator of a treaty and only while the treaty is a draft. Once a treaty is 'live' there should be no way to delete a treaty
router.delete('/id', async function (req, res){
    if (req.body.status.proposal){
        res.status(400).send(`You cannot delete a Treaty once it has been published`);
    }
    try{
        let treaty = await Treaty.findById({_id: req.body._id});        

        treaty.status.deleted = true;
        treaty = await treaty.saveActivity(treaty, `Treaty Deleted By ${treaty.creator}`);
        let temp = treaty.name;
        await Treaty.findByIdAndDelete({_id: req.body._id})
        res.status(200).send(`We killed treaty: ${temp}`);            
    }//try
    catch (err) {
    logger.error(`Catch runSpacecraftLoad Error: ${err.message}`, {
      meta: err,
    });
    res.status(400).send(`Error deleting treaty: ${err}`);
  }//catch
});

module.exports = router;