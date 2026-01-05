<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" version="1.0" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" media-type="text/html" encoding="utf-8" indent="yes" />
    <xsl:template match="interlinear-text">
        <xsl:element name="html">
        <xsl:attribute name="xml:lang">
                <xsl:value-of select="'en'"/>
        </xsl:attribute>
        <xsl:attribute name="lang">
                <xsl:value-of select="'en'" />
        </xsl:attribute>
                    <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <link href="../styles/main.css" type="text/css" rel="stylesheet"/>
            <link href="styles/igt.css" type="text/css" rel="stylesheet"/>
                <xsl:element name="script">
                        <xsl:attribute name="type">
                                <xsl:value-of select="'text/javascript'"/>
                        </xsl:attribute>
                        <xsl:attribute name="src">
                                <xsl:value-of select="'playme.js'"/>
                        </xsl:attribute>
                </xsl:element>
                <title>
                    <xsl:apply-templates select="item[@type='title']" />
                </title>
            </head>
            <body>
            <div id="container">
                <div id="header">

<!-- The first <CHANGE-ME> should be the url of the text account.  For example, for kwadacha the path is http://depts.washington.edu/kwatexts
Note the lack of extra quotes, and the lack of slash at the end.
The second <CHANGE-ME> is the title you want displayed on the webpage.  For example, the kwadacha website has
Nuts'oodalh Texts and Recordings
Note that there are no quotes. -->
                <h2><a href="<CHANGE-ME>"><CHANGE-ME></a></h2>
            </div>
            <div id="content">
                <div id="titleBox">
                <h3 class="mainTitle"><span class="title"><xsl:apply-templates select="item[@type='title']"/></span></h3>
                <h4 class="mainTitle"><xsl:apply-templates select="author"/></h4>
                </div>
                <div class="main">
                <ol>
                    <xsl:apply-templates select="phrases"/>
                </ol>
                </div>
                </div>
                </div>
            </body>
        </xsl:element>
    </xsl:template>

    <xsl:template match="phrase">
        <xsl:variable name="id">
                <xsl:value-of select="@id"/>
        </xsl:variable>
        <xsl:variable name="q">'</xsl:variable>
        <xsl:variable name="playme">
                <xsl:value-of select="concat('playme(',$q,$id,$q,')')"/>
        </xsl:variable>
        <li><div class="phrase">
                <xsl:apply-templates />
        <div class="audio">
        <xsl:element name="img">
                <xsl:attribute name="width">
                        <xsl:value-of select="20"/>
                </xsl:attribute>
                <xsl:attribute name="src">
                        <xsl:value-of select="'../imgs/speaker.png'"/>
                </xsl:attribute>
                <xsl:attribute name="onclick">
                        <xsl:value-of select="$playme"/>
                </xsl:attribute>
        </xsl:element>
        <xsl:element name="audio">
                <xsl:attribute name="height">
                        <xsl:value-of select="35"/>
                </xsl:attribute>
                <xsl:attribute name="preload">
                        <xsl:value-of select="'preload'"/>
                </xsl:attribute>
                <xsl:attribute name="id">
                        <xsl:value-of select="$id"/>
                </xsl:attribute>
                <xsl:element name="source">
                        <xsl:attribute name="src">
                                <xsl:value-of select="concat('audio/',$id,'.ogg')"/>
                        </xsl:attribute>
                        <xsl:attribute name="type">
                                <xsl:value-of select="'audio/ogg'"/>
                        </xsl:attribute>
                </xsl:element>
                <xsl:element name="source">
                        <xsl:attribute name="src">
<!-- The next 3 <CHANGE-ME>'s are the type of audio, e.g. mp3 or wav -->
                                <xsl:value-of select="concat('audio/',$id,'.<CHANGE-ME>')"/>
                        </xsl:attribute>
                        <xsl:attribute name="type">
                                <xsl:value-of select="'audio/mpeg'"/>
                        </xsl:attribute>
                </xsl:element>
                <xsl:comment><![CDATA[[if gt IE 6]>
                <object id="ie1" classid="clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6" width="200" height="45" type="audio/mpeg" data="audio/]]><xsl:value-of select="$id"/><![CDATA[.<CHANGE-ME>">
                <param name="src" value="audio/]]><xsl:value-of select="$id"/><![CDATA[.<CHANGE-ME>" />
<param name="autoplay" value="false"/>
                <![endif]]></xsl:comment>
                <xsl:comment><![CDATA[[if !IE]><!]]></xsl:comment>
                <xsl:element name="object">
                        <xsl:attribute name="type">
                                <xsl:value-of select="'audio/mpeg'"/>
                        </xsl:attribute>
                        <xsl:attribute name="data">
<!-- These next two are the audio type, e.g. mp3 or wav -->
                                <xsl:value-of select="concat('audio/',$id,'.<CHANGE-ME>')"/>
                        </xsl:attribute>
                <xsl:comment><![CDATA[<![endif]]]></xsl:comment>
                <xsl:element name="param">
                        <xsl:attribute name="name">
                                <xsl:value-of select="'url'"/>
                        </xsl:attribute>
                        <xsl:attribute name="value">
                                <xsl:value-of select="concat('audio/',$id,'.<CHANGE-ME>')"/>
                        </xsl:attribute>
                </xsl:element>
                <param name="autoStart" value="0" />
                </xsl:element>
                <xsl:comment><![CDATA[[if gt IE 6]><!]]></xsl:comment>
                <xsl:comment><![CDATA[<![endif]]]></xsl:comment>
        </xsl:element>
        </div>
        </div>
        </li>
    </xsl:template>

    <xsl:template match="words">
        <div class="words"><xsl:apply-templates/></div>
    </xsl:template>

    <xsl:template match="word">
        <span class="word">
            <xsl:apply-templates />
        </span>
    </xsl:template>

    <xsl:template match="item[@type='gls']">
        <xsl:choose>
                <xsl:when test="local-name(parent::*) = 'word'">
                        <br />
                        <xsl:choose>
                                <xsl:when test=". = ''">
                                        ####
                                </xsl:when>
                                <xsl:otherwise>
                                        <xsl:value-of select="." />
                                </xsl:otherwise>
                        </xsl:choose>
                </xsl:when>
                <xsl:otherwise>
                        <div class="phr_gls"><xsl:value-of select="." /></div>
                </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="item[@type='txt']">
        <span class="txt">
            <xsl:value-of select="." />
        </span>
    </xsl:template>



</xsl:stylesheet>
