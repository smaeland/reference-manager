'use strict'

const baseurl = "https://steffen.maeland.gitlab.io/reference-manager/";
const col_max_chars = 75;
var table;

$(document).ready(function() {

    $.get({url: 'data.yml', dataType: "text"})
        .done(function (data) {
            
            var inventory = jsyaml.load(data);
            console.log(inventory)
            
            table = $('#table').DataTable({
                data: inventory['data'],
                lengthMenu: [[100, 200, -1], [100, 200,"All"]],
                columns: [
                    {
                        data: "title",
                        title: "Title",
                        render: function(data) {
                            if (data.length > col_max_chars) {
                                return data.slice(0, col_max_chars-3) + '...'
                            }
                            return data
                        }
                    },
                    {                        
                        data: "author",
                        title: "Author",
                        render: function(data) {
                            data = data.replace(/\sand/g, ',')    
                            let num_authors = (data.match(/,/g) || []).length;
                            if (num_authors > 3 || data.length > col_max_chars) {
                                return data.split(',')[0] + ' et al.'
                            }
                            return data
                        }
                    },
                    {
                        data: "year",
                        title: "Year"
                    },
                    {
                        data: "tags",
                        title: "Tags",
                        render: function(data) {
                            return data.join(', ')
                        }
                    },
                    {
                        // add https://jpswalsh.github.io/academicons/ here 
                        data: "uri",
                        title: "URI",
                        render: function(data, type) {
                            if (type === 'display') {
                                let domain = data.split('/')[2]
                                return '<a href="' + data + '" target="blank">' + domain + '</a>';
                            }
                            return data;
                        }
                    },
                    {
                        data: "pdf",
                        //title: "PDF",
                        render: function(data, type) {
                            if (type === 'display') {
                                return '<a href="' + baseurl + 'pdfs/' + data + '" target="blank"><img src="icons/file-earmark-pdf.svg" width="22" height="22"></a>';
                            }
                            return data;
                        }
                    },
                    {
                        data: "bibtex",
                        title: "BibTeX",
                        defaultContent: "(empty)" 
                    },
                    {
                        data: "notes",
                        title: "Notes",
                        defaultContent: "(empty)" 
                    },
                    {   
                        data: null,
                        //title: "Graph",
                        render: function(data, type, row) {
                            let searchterm = row['title'].replace(/\ /g, '%20')
                            let link = 'https://www.connectedpapers.com/search?q=' + searchterm;
                            return '<a href="' + link + '" target="blank"><img src="icons/diagram-2.svg" width="22" height="22"></a>';
                        }
                    },
                    {
                        data: null,
                        //title: "Scholar",
                        render: function(data, type, row) {
                            let searchterm = row['title'].replace(/\ /g, '%20')
                            let link = 'https://scholar.google.com/scholar?q=' + searchterm;
                            return '<a href="' + link + '" target="blank"><img src="icons/google-scholar.svg" width="22" height="22"></a>';
                        }
                    }
                ],
                columnDefs: [
                    {
                        // "Hidden" columns - bibtex and notes
                        visible: false,
                        targets: [6, 7],
                        searchable: false
                    },
                    {
                        // Disable sorting for icon/link columns
                        bSortable: false,
                        targets: [5, 8, 9],
                        searchable: false
                    }                     
                ]
            });
    });
    
    $('#table').on('click', 'tr', function () {
        let data = table.row($(this)).data();
        //console.log(data)
        let author = data["author"] + ' (' + data['year'] + ')';
        let notes = data["notes"]
        if (notes === undefined) {
            notes = ''
        }        
        $('#detailModal').modal("show");
        $('.modal-title').text(data["title"]);
        $('.modal-author').text(author);
        $('.modal-bibtex').text(data["bibtex"]);
        $('.modal-notes').text(notes);
    }); 
    
});
