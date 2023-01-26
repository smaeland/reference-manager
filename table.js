'use strict'

const baseurl = "https://smaeland.github.io/reference-manager/";
const col_max_chars = 150;
var table;
var inventory;
var tagColors = {};
const numTagColors = 21;



function getTags(inv) {
    const data = inv["data"];

    function addIncrement(dict, key) {
        if (key in dict) {
            dict[key]++;
        }
        else {
            dict[key] = 1;
        }
    }

    // Get tag names and their counts 
    let tagCounts = {};
    for (const elementKey in data) {
        const elementTags = data[elementKey].tags;
        for (let j = 0; j < elementTags.length; j++) {
            addIncrement(tagCounts, elementTags[j]);
        }
    }

    let tagsSorted = Object.keys(tagCounts).sort(
        function (a, b) {
            return tagCounts[b] - tagCounts[a]
        }
    );
    console.log(tagsSorted)
    
    // Assign colors to each tag
    for (let i = 0; i < tagsSorted.length; i++) {
        tagColors[tagsSorted[i]] = i % numTagColors;
    }
    console.log('tagColors:', tagColors)
};

$(document).ready(function() {

    $.get({url: 'data.yml', dataType: "text"})
        .done(function (data) {
            
            var inventory = jsyaml.load(data);
            getTags(inventory);

            table = $('#table').DataTable({
                dom: 'Plfrtip',
                searchPanes: {
                    initCollapsed: true,
                    columns: [3, 2],
                    cascadePanes: true,
                    dtOpts: {
                        select: {
                            style: 'multi'
                        },
                        order: [[1, "count"]]
                    },
                    i18n: {
                        emptyMessage: "<i><b>No tag</b></i>"
                    }
                },
                data: inventory['data'],
                lengthMenu: [[100, 200, -1], [100, 200, "All"]],
                columns: [
                    {
                        data: "title",
                        title: "Title",
                        render: function(data, type, row, meta) {
                            return data.length > col_max_chars ? '<span title="'+data+'">'+data.substr(0, col_max_chars-3)+'...</span>' : data;
                        }
                    },
                    {                        
                        data: "author",
                        title: "Author",
                        render: function(data) {
                            data = data.replace(/\sand/g, ',')    
                            let num_authors = (data.match(/,/g) || []).length;
                            if (num_authors > 3 || data.length > col_max_chars) {
                                return '<span title="'+data+'">'+data.split(',')[0] + ' et al.</span>'
                                //return data.split(',')[0] + ' et al.'
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
                        // https://datatables.net/extensions/searchpanes/rendering
                        render: {
                            _: function(data) {
                                let badges = [];
                                data.forEach(function (tag, index) {
                                    badges.push(`<span class="badge badge-color-${tagColors[tag]}">${tag}</span>`);
                                });
                                return badges.join()
                            },
                            //sp: '[]'
                            sp: function(data) {
                                let badges = [];
                                data.forEach(function (tag, index) {
                                    badges.push(`<span class="badge badge-color-${tagColors[tag]}">${tag}</span>`);
                                });
                                return badges
                            },
                        },
                        searchPanes: {
                            orthogonal: 'sp'
                        }
                    },
                    {
                        // add https://jpswalsh.github.io/academicons/ here 
                        data: "uri",
                        title: "URI",
                        render: function(data, type) {
                            if (type === 'display') {
                                
                                let icon = "link-45deg.svg"
                                let domain = data.split('/')[2]
                                
                                if (domain.includes('arxiv')) {
                                    icon = "arxiv.svg"
                                }
                                else if (domain.includes('doi')) {
                                    icon = "doi.svg"
                                }
                                else if (domain.includes('elsevier') || domain.includes('sciencedirect')) {
                                    icon = "elsevier.svg"
                                }
                                else if (domain.includes('ieee')) {
                                    icon = "ieee.svg"
                                }
                                else if (domain.includes('jstor')) {
                                    icon = "jstor.svg"
                                }
                                else if (domain.includes('springer')) {
                                    icon = "springer.svg"
                                }

                                return '<a href="' + data + '" target="blank"><img src="icons/' + icon + '" width="22" height="22"></a>';
                            }

                            return data;
                        }
                    },
                    {
                        data: "pdf",
                        title: "PDF",
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
                        targets: [4, 5, 8, 9],
                        searchable: false
                    }                     
                ]
            });
    });
    
    $('#table').on('click', 'tr', function () {
        let data = table.row($(this)).data();
        console.log(data)
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
