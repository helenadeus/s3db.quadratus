var intface = {
	uidReload : function(s3uid, user_was_changed){
	   var eff = s3db.U[user_was_changed][s3uid].effective_permission;
		// get the spans and changed them
		if(typeof(eff)!='undefined'){
			for (var i=0; i<eff.length; i++) {
				var span = document.getElementById(s3uid+"_perm_"+i);
				if(span){
					var pi =  eff[i];
					color_permission_square(span, pi);
				}
			}
		}
		//display new permission canvas; clear the old one first
		if(typeof(s3db.U[user_was_changed].pl)!='undefined' && typeof(s3db.U[user_was_changed].pl[s3uid]!='undefined')){
			delete s3db.U[user_was_changed].pl[s3uid];
		}
		explainPermission(s3uid.substr(0,1), s3uid.substr(1, s3uid.length-1));

		//also reload the children
		UID.childrenReload(s3uid,user_was_changed,"intface.childrenReload('"+s3uid+"', '"+user_was_changed+"')");
	},
	
	childrenReload : function (uid, user_was_changed) {
		var E = uid.substr(0,1);
		var I = uid.substr(1,uid.length-1);
		var childEntities = s3db.core.inherits[E];	
		for (var i=0, il=childEntities.length; i<il; i++) {			
			var childType = childEntities[i];
			var childBox = 	s3db.core.boxes[childType];
			var allChildren = s3db.U[s3db.user_id][uid][childType];
			var restrictChildren = s3db.U[user_was_changed][uid][childType];
			if(typeof(allChildren)!='undefined'){
				for (var j in allChildren) {
					
					if(typeof(j)!='undefined'){
						var c_uid = childType+allChildren[j][s3db.core.ids[childType]];
						if(typeof (restrictChildren)!='undefined' && typeof (restrictChildren[j])!='undefined'){
							var eff = restrictChildren[j].effective_permission;
							var assi = restrictChildren[j].assigned_permission;
						}
						else {
							var eff = 'nnn';
							var assi = '---';
							console.log("User cannot query uid "+j+". Exact permission could not be retrieved");
						}
						
						for (var k=0; k<eff.length; k++) {
							var span = document.getElementById(c_uid+"_perm_"+k);
							if(span){
								var pi =  eff[k];
								color_permission_square(span, pi);
							}
						}

						
						for (var l=0; l<assi.length; l++) {
							var span = document.getElementById(c_uid+"_assigned_"+l);
							if(span){
								var ti =  assi[l];
								color_permission_square(span, ti);
							}
						}
					}
				}
			}
		}
	},

	children : function (uid, user_id, childType) {
		//remove loading
		if(document.getElementById(s3db.core.ids[childType]+"_loading"))
		{remove_element(s3db.core.ids[childType]+"_loading");}
		
		//find the box where this data will go into
		var box = s3db.core.boxes[childType];
		var E = uid.substr(0,1);
		var I = uid.substr(1,uid.strlen-1);
		var L = s3db.core.labels[childType];
		var S3DB_ID = s3db.core.ids[E];
		var data = s3db.U[user_id][uid][childType];

		//Clean previous data first
		document.getElementById(box ).innerHTML = "";
		
		//Starting building a div for every uid; 2 span triple boxes for permissions
		if(data){
			for (var c_uid in data) {
				var opt = document.createElement('div'); 
				opt.id = c_uid;
				document.getElementById(box).appendChild(opt);
				opt.setAttribute('onMouseOver', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MovColor+'"}');
				opt.setAttribute('onClick', "clickS3DB('"+childType+"', '"+c_uid.substr(1,c_uid.length-1)+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
				opt.setAttribute('onMouseOut', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MoffColor+'"}');
				
				//Build a span for assigned permissions
				var q =  data[c_uid]['assigned_permission'];
				
				for (var k=0, kl=q.length; k<kl; k++) {//until the end of the state size
						
					var qi= q[k].match(/^y|n|s|-/i);
					var span = document.createElement('span');
					span.id = opt.id+"_assigned_"+k;
					color_permission_square(span, qi);
					opt.appendChild(span);
					
					//Add click for assined
					// only if this span belongs to a user that is not the same as s3db.user_id
					if(s3db.activeU.user_id!=s3db.user_id){
						 rightClickSpan(span.id, opt.id);
					}

				}

				//put a span between the assigned and effective to distinguish
				var clutter = document.createElement('span');
				clutter.id = 'perm_clutter';
				clutter.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
				opt.appendChild(clutter);

				//Now draw the effective
				var p =  data[c_uid]['effective_permission'];
				for (var j=0, k=p.length; j<k; j++) {//until the end of the state size
						
					var pi= p[j].match(/^y|n|s|-/i);
					var span = document.createElement('span');
					span.id = opt.id+"_perm_"+j;
					color_permission_square(span, pi);
					opt.appendChild(span);

					
				}

				//span to separate text from colors
				span = document.createElement('span');
				span.innerHTML = '&nbsp;&nbsp;&nbsp;';
				opt.appendChild(span);

				//create a span for the text
				var span = document.createElement('span');

				//Get the text from the Label
				if(L.length==1){
				span.innerHTML = c_uid+" ("+data[c_uid][L]+")";
				}
				else {
					var tmp = "";
					for (var Li=0; Li<L.length; Li++) {
						tmp +=  data[c_uid][L[Li]]+" ";
					}
					
					span.innerHTML = c_uid+" ("+tmp+")";
				}
				 opt.appendChild(span);
			}
		}
	},

	displayEntity : function (user_id, E) {
		var box = s3db.core.boxes[E];	
		var L = s3db.core.labels[E];
		var S3DB_ID = s3db.core.ids[E];
		var data = s3db.U[user_id][E];
		//Clean previous data first
		document.getElementById(box ).innerHTML = "";
		
		if(data){
			for (var c_uid in data) {
				var opt = document.createElement('div'); 
				opt.id = c_uid;
				document.getElementById(box).appendChild(opt);
				opt.setAttribute('onMouseOver', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MovColor+'"}');
				opt.setAttribute('onClick', "clickS3DB('P', '"+c_uid.substr(1,c_uid.length-1)+"'); this.style.color='"+ClickColor+"';this.setAttribute('clicked', 'true')");
				opt.setAttribute('onMouseOut', 'if(this.getAttribute("clicked")!="true") {this.style.color="'+MoffColor+'"}');
				
				//Build a span for assigned permissions
				var q =  data[c_uid]['assigned_permission'];
				
				for (var k=0, kl=q.length; k<kl; k++) {//until the end of the state size
						
					var qi= q[k].match(/^y|n|s|-/i);
					var span = document.createElement('span');
					span.id = opt.id+"_assigned_"+k;
					color_permission_square(span, qi);
					opt.appendChild(span);
					
					//Add click for assined
					// only if this span belongs to a user that is not the same as s3db.user_id
					if(s3db.activeU.user_id!=s3db.user_id){
						 rightClickSpan(span.id, opt.id);
					}

				}

				//put a span between the assigned and effective to distinguish
				var clutter = document.createElement('span');
				clutter.id = 'perm_clutter';
				clutter.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
				opt.appendChild(clutter);

				//Now draw the effective
				var p =  data[c_uid]['effective_permission'];
				for (var j=0, k=p.length; j<k; j++) {//until the end of the state size
						
					var pi= p[j].match(/^y|n|s|-/i);
					var span = document.createElement('span');
					span.id = opt.id+"_perm_"+j;
					color_permission_square(span, pi);
					opt.appendChild(span);

					
				}

				//span to separate text from colors
				span = document.createElement('span');
				span.innerHTML = '&nbsp;&nbsp;&nbsp;';
				opt.appendChild(span);

				//create a span for the text
				var span = document.createElement('span');

				//Get the text from the Label
				if(L.length==1){
				span.innerHTML = c_uid+" ("+data[c_uid][L]+")";
				}
				else {
					var tmp = "";
					for (var Li=0; Li<L.length; Li++) {
						tmp +=  data[c_uid][L[Li]]+" ";
					}
					
					span.innerHTML = c_uid+" ("+tmp+")";
				}
				 opt.appendChild(span);
			}
		}
	},
	
	compareEntity : function (user_id, E) {
		var childType  = E;
		var box = s3db.core.boxes[childType];
		var L = s3db.core.labels[childType];
		var S3DB_ID = s3db.core.ids[E];
		var completedata = s3db[childType];
	    var userdata = s3db.U[user_id][childType];
		
		//The goal is to keep the same order in userdata as in complete data; new data will be a complete replacement of userdata 
		var newdata = {};
		delete s3db.U[user_id][childType];
		s3db.U[user_id][childType] = {};
		for (var c_uid in completedata) {
		     //need to create a clone instead of a link; so slice seems to be the only thing that works
			 var tmp = copy_parms(completedata[c_uid]);
			 if(typeof(userdata[c_uid])!='undefined'){
				 tmp.effective_permission =  userdata[c_uid].effective_permission;
				 tmp.assigned_permission =  userdata[c_uid].assigned_permission;
			 }
			 else {
				 tmp.effective_permission =  '---';
				 tmp.assigned_permission =  '---';
				// console.log('no information for user '+user_id+' on '+c_uid+'. Assuming default nnn');
			 }
			 newdata[c_uid] = tmp;
			 s3db.U[user_id][c_uid] = tmp;
			 s3db.U[user_id][childType][c_uid] = s3db.U[user_id][c_uid];

		}
		
		intface.displayEntity(user_id, childType);
	},

	compareChildren : function (uid, user_id, childType) {
		//start off by creating U1 child divs, if not already there;
		var box = s3db.core.boxes[childType];
		var E = uid.substr(0,1);
		var I = uid.substr(1,uid.strlen-1);
		var L = s3db.core.labels[childType];
		var S3DB_ID = s3db.core.ids[E];
		
		//This will be the complete data; permissions will be added from the user being queried
		var completedata = s3db[uid][childType];
		//This will be the data that teh selected user can see
		var userdata = s3db.U[user_id][uid][childType];
		var newdata = {};
		for (var c_uid in completedata) {
			 var tmp = completedata[c_uid];
			 if(typeof(userdata[c_uid])!='undefined'){
				 tmp.effective_permission =  userdata[c_uid].effective_permission;
				 tmp.assigned_permission =  userdata[c_uid].assigned_permission;
			 }
			 else {
				 tmp.effective_permission =  '---';
				 tmp.assigned_permission =  '---';
				// console.log('no information for user '+user_id+' on '+c_uid+'. Assuming default nnn');
			 }
			 //newdata[c_uid] = tmp;
			 s3db.U[user_id][c_uid] = tmp;
			 s3db.U[user_id][uid][childType][c_uid] = s3db.U[user_id][c_uid];
		}
		intface.children(uid, user_id, childType);	
	},

	loadingChildren : function(E){
		var childEntities = s3db.core.inherits[E];	
		if(typeof(childEntities)!='undefined'){
			for (var i=0,il=childEntities.length; i<il; i++) {
				var load = document.createElement('div');
				load.id = childEntities[i]+"_loading";
				var imag = document.createElement('img');
				imag.src = 'blue_loading.gif';
				load.appendChild(imag);
				//parent span it the child div
				
					  var  box = s3db.core.boxes[childEntities[i]];
					  document.getElementById(box).insertBefore(load, document.getElementById(box).firstChild);
			}
		}
		return false;
		
	},

	hideLoading : function (E) {
		    
			if (document.getElementById(E+"_loading")) {
				var e = document.getElementById(E+"_loading");
				if(e){
				e.parentNode.removeChild(e);
				}
				return false;
			}
	},

	removeChildren : function(E) {
			var childEntities = s3db.core.inherits[E];
			if(typeof(childEntities)!='undefined'){
				for (var i=0,il=childEntities.length; i<il; i++) {
					var childType = childEntities[i];
					var  box = s3db.core.boxes[childType];
					document.getElementById(box).innerHTML = "";
					intface.removeChildren(childType);
				}
			}
	},
	
}