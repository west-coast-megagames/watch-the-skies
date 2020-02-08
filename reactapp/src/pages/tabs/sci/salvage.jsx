import React, { Component } from 'react';
import { Cascader, Button } from 'rsuite';


class Salvage extends Component {
  state = { 
  }
  
  render() { 
    //console.log('PROPS:', this.props);
    const labResearchTypes = ["Knowledge", "Tech", "Analysis"];   // Types of research that can be studied by Labs (Remove Knowledge after testing)
    const { allKnowledge, team } = this.props;                    // Prop Objects holding all Knowledge known and team
    //console.log("ALLKNOWLEDGE=",allKnowledge);

    /*------------------------------
    * function createCascadeArray
    *-------------------------------
    * This function parses the allKnowledge prop array in its current format and creates
    * A new array in the format that is friendly to the rsuite component cascade.
    * A sample of what the new array should look like is here:
    *
    *export default [
    *  {
    *    value: '1',
    *    label: 'Top level',
    *    children: [
    *      {
    *        label: 'Second Level',
    *        value: '1-1',
    *        children: [
    *          {
    *            value: '1-1-1',
    *            label: 'Third Level'
    *          },
    *          {
    *            value: '1-1-2',
    *            label: 'Third Level'
    *          },
    *-------------------------------*/
    function createCascadeArray (list2Traverse, parentLevel) {
      let cnt = 0;            // counts the number of records at this level
      const newArr = list2Traverse.map(
        function(val){ 
          cnt += 1;

          // If parent is 0, then we are listing categories of Knowledge, Tech, or Analysis
          if (parentLevel===0)  { 
            // create new fields list in childrenList
            const tempList = allKnowledge.map(knowledge => {
              if (knowledge.type === val) { return (knowledge.field) };
            });
            
            // Make the entries in the chilrenList Array unique
            const childrenList = [...new Set(tempList)];    
           
            // find its children
            const childrenArray = createCascadeArray (childrenList, parentLevel+1);
            
            // return the object entry
            return {id:cnt, label:val, children:childrenArray}; 
          }
          
          // If parent is 1, then we are listing Scientific Fields (Biology, Social Science, etc)
          if (parentLevel===1)  {  
            //create new names list in childrenList
            const tempList = allKnowledge.map(knowledge => {
              if (knowledge.field === val) {
                return (knowledge.name)
              };
            });
            const childrenList = [...new Set(tempList)];    // Make the entries in the chilrenList Array unique
            //create new name list in childrenList
            const childrenArray = createCascadeArray (childrenList, parentLevel+1)
            return {id:parentLevel + "." + cnt, label:val, children:childrenArray}; 
          }
           
          // If parent is 2, then we are listing Scientific names (Biology I, Bilogy II, etc.)
          if (parentLevel===2)  { 
            //no children at this level only key and label
            return {id:parentLevel + "." + cnt, label:val}; 
          }
      }) 
      return (newArr);
    };

    


  
    
    console.log("============START===========");
    const myResult = createCascadeArray(labResearchTypes,0);
    //console.log("MYRESULT=",myResult);

    
    
    const styles = { width: 224, marginBottom: 10 };

    return(
      <div>
        <Cascader
          toggleComponentClass={Button}
          size="xs"
          placeholder="Default"
          searchable="false"
          parentSelectable="true"
          data={myResult}
          style={styles}
        />
      </div>
    );
  }
}

export default Salvage;

