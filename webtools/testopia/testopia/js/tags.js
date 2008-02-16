/*
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is the Bugzilla Testopia System.
 *
 * The Initial Developer of the Original Code is Greg Hendricks.
 * Portions created by Greg Hendricks are Copyright (C) 2006
 * Novell. All Rights Reserved.
 *
 * Contributor(s): Greg Hendricks <ghendricks@novell.com>
 *                 Ryan Hamilton <rhamilton@novell.com>
 *                 Daniel Parker <dparker1@novell.com>
 */

TestopiaObjectTags = function(obj, id){
    this.remove = function(){
        var form = new Ext.form.BasicForm('testopia_helper_frm',{});
        form.submit({
            url: 'tr_tags.cgi',
            params: {action: 'removetag', type: obj, id: id, tag: getSelectedObjects(Ext.getCmp(obj + 'tagsgrid'), 'tag_name')},
            success: function(){
                ds.load();
            },
            failure: testopiaError
        });
    };
    this.store = new Ext.data.JsonStore({
        url: 'tr_tags.cgi',
        baseParams: {action: 'gettags', type: obj, id: id},
        root: 'tags',
        id: 'tag_id',
        fields: [
            {name: 'tag_id', mapping: 'tag_id'},
            {name: 'tag_name', mapping: 'tag_name'},
            {name: 'run_count', mapping:'run_count'},
            {name: 'case_count', mapping:'case_count'},
            {name: 'plan_count', mapping:'plan_count'}
        ]
    });
    var ds = this.store;
    this.columns = [
        {dataIndex: 'tag_id', hidden: true, hideable: false},
        {header: 'Name', width: 150, dataIndex: 'tag_name', id: 'tag_name', sortable:true, hideable: false},
        {header: 'Cases', width: 35, dataIndex: 'case_count', sortable:true, hidden: true},
        {header: 'Runs', width: 35, dataIndex: 'run_count', sortable:true, hidden: true},
        {header: 'Plans', width: 35, dataIndex: 'plan_count', sortable:true, hidden: true}
    ];
    
    var addButton = new Ext.Button({
        id: 'tag_add_btn',
        icon: 'testopia/img/add.png',
        iconCls: 'img_button_16x',
        handler: function(){
            var form = new Ext.form.BasicForm('testopia_helper_frm',{});
            form.submit({
                url: 'tr_tags.cgi',
                params: {action: 'addtag', type: obj, id: id, tag: Ext.getCmp('tag_lookup').getRawValue()},
                success: function(){
                    ds.load();
                },
                failure: testopiaError
            });
        }
    });
    
    var deleteButton = new Ext.Button({
        icon: 'testopia/img/delete.png',
        iconCls: 'img_button_16x',
        handler: this.remove
    });
        
    TestopiaObjectTags.superclass.constructor.call(this, {
        title: 'Tags',
        split: true,
        region: 'east',
        layout: 'fit',
        width: 200,
        autoExpandColumn: "tag_name",
        collapsible: true,
        id: obj + 'tagsgrid',
        loadMask: {msg:'Loading ' + obj + ' tags...'},
        autoScroll: true,
        sm: new Ext.grid.RowSelectionModel({
            singleSelect: false
        }),
        viewConfig: {
            forceFit:true
        },
        tbar: [
            new TagLookup({}), addButton, deleteButton
        ]
    });

    this.on('rowcontextmenu', this.onContextClick, this);
    this.on('activate', this.onActivate, this);
};

Ext.extend(TestopiaObjectTags, Ext.grid.GridPanel, {
    onContextClick: function(grid, index, e){
        if(!this.menu){ // create context menu on first right click
            this.menu = new Ext.menu.Menu({
                id:'tags-ctx-menu',
                items: [
                    {
                         text: 'Remove Selected Tags', 
                         icon: 'testopia/img/delete.png',
                         iconCls: 'img_button_16x',
                         handler: this.remove
                    },{
                        text: 'Refresh List', 
                        handler: function(){
                            grid.store.reload();
                        } 
                    }
                ]
            });
        }
        e.stopEvent();
        if (grid.getSelectionModel().getCount() < 1){
            grid.getSelectionModel().selectRow(index);
        }
        this.menu.showAt(e.getXY());
    },

    onActivate: function(event){
        if (!this.store.getCount()){
            this.store.load();
        }
    }
});

/*
 * TestopiaProductTags - Display a grid of tags for a product, or a user.
 */
TestopiaProductTags = function(title, type, product_id){
    var tag_id;
    this.product_id = product_id;
    
    this.store = new Ext.data.JsonStore({
        url: 'tr_tags.cgi',
        baseParams: {action: 'gettags', type: type},
        root:'tags',
        id: 'tag_id',
        fields: [
            {name: 'tag_id', mapping: 'tag_id'},
            {name: 'tag_name', mapping: 'tag_name'},
            {name: 'run_count', mapping:'run_count'},
            {name: 'case_count', mapping:'case_count'},
            {name: 'plan_count', mapping:'plan_count'}
        ]
    });
    var ds = this.store;
    
    this.columns = [
        {header: "ID", dataIndex: 'tag_id', hidden: true},
        {header: 'Name', width: 150, dataIndex: 'tag_name', id: 'tag_name', sortable:true},
        {header: 'Cases', width: 35, dataIndex: 'case_count', sortable:true},
        {header: 'Runs', width: 35, dataIndex: 'run_count', sortable:true},
        {header: 'Plans', width: 35, dataIndex: 'plan_count', sortable:true}
    ];
    
    var filter = new Ext.form.TextField({
        allowBlank: true,
        id: 'rungrid-filter',
        selectOnFocus: true
    });
    
    TestopiaProductTags.superclass.constructor.call(this, {
        title: title,
        id: type + 'tags',
        loadMask: {msg:'Loading ' + title + ' ...'},
        autoExpandColumn: "tag_name",
        autoScroll: true,
        sm: new Ext.grid.RowSelectionModel({
            singleSelect: false
        }),
        viewConfig: {
            forceFit:true
        }
    });
    
    this.on('rowcontextmenu', this.onContextClick, this);
    this.on('activate', this.onActivate, this);
};

Ext.extend(TestopiaProductTags, Ext.grid.GridPanel, {
    onContextClick: function(grid, index, e){
        
        if(!this.menu){ // create context menu on first right click
            this.menu = new Ext.menu.Menu({
                id:'tags-ctx-menu',
                items: [
                    {
                        text: 'Refresh', 
                         handler: function(){
                             ds.reload();
                         }
                     }
                ]
            });
        }
        e.stopEvent();
        this.menu.showAt(e.getXY());
    },

    onActivate: function(event){
        if (!this.store.getCount()){
            this.store.load({params: {product_id: this.product_id}});
        }
    }
});

TagsUpdate = function(type, grid){
    function commitTag(action, value, grid){
        var form = new Ext.form.BasicForm('testopia_helper_frm',{});
        form.submit({
            url: 'tr_tags.cgi',
            params: {action: action, tag: value, type: type, id: getSelectedObjects(grid, type+'_id')},
            success: function(){},
            failure: testopiaError
        });
    }
     var win = new Ext.Window({
         title: 'Add or Remove Tags',
         id: 'tags_edit_win',
         layout: 'fit',
         split: true,
         plain: true,
         shadow: false,
         width: 350,
         height: 150,
         items: [
            new Ext.FormPanel({
                labelWidth: '40',
                bodyStyle: 'padding: 5px',
                items: [new TagLookup({
                    fieldLabel: 'Tags'
                })]
            })
        ],
        buttons: [{
            text:'Add Tag',
            handler: function(){
                commitTag('addtag', Ext.getCmp('tag_lookup').getRawValue(), grid);
                win.close();
            }
        },{
            text: 'Remove Tag',
            handler: function(){
                commitTag('removetag', Ext.getCmp('tag_lookup').getRawValue(), grid);
                win.close();
            }
        },{
            text: 'Close',
            handler: function(){
                win.close();
            }
        }]
    });
    win.show();
};
         