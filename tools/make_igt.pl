#!/usr/bin/perl
# this script takes igt formatted in LaTeX using the covington package and
# converts it into an xml format as recommended by the GOLD standards

$#ARGV < 0 and die "Usage: $0 <source_file>\n";

#setting up input and output
$l = length ($ARGV[0]);
$name = (substr($ARGV[0],0,$l-4));
if (-e "$name.xml") {

    print "$name.xml already exists.  Continue anyway? [yn]";
    if (<STDIN> =~ /^[Yy]/) {
        print "Okay, continuing and overwriting output file ... \n";
    } else {
        print "Okay, quitting ... \n";
        exit(0)
    }
}

open(INPUT, "<:encoding(iso-8859-1)", $ARGV[0]) || die "Cannot open $ARGV[0]";
open(OUTPUT, ">:utf8", "$name.xml") || die "Cannot create $name.xml.\n";

#put the xml header into the output file:
print OUTPUT "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n";
print OUTPUT "<?xml-stylesheet type=\"text/xsl\" href=\"igt.xsl\"?>\n";
print OUTPUT "<interlinear-text>\n";


#put each line of the input file in an array
@rawlines = <INPUT>;
close(INPUT);


#strip out the MS newlines and convert \textipa{\textbeltl} to ɬ
@lines =(&MSstrip(@rawlines));


#get the title and author and write them to the output file
&titauth(@lines);

#start the phrases section
print OUTPUT "<phrases>\n";

#make the IGT items
&parse_covington(@lines);

#end the phrases section and the root
print OUTPUT "</phrases>\n";
print OUTPUT "</interlinear-text>";

#all done
close(OUTPUT);
print OUPUT;



sub MSstrip
{
    foreach $line (@_)
    {
        $line =~ s/\r$//g;
        $line =~ s/\\textipa{\\textbeltl}/\x{26c}/g;
        push (@lines, $line);
    }
    return @lines;
}


sub titauth
{
    foreach $line (@_)
    {
        if ($line =~/^\\title/){
            $title = $line;
            $title =~ s/^\\title{(.*)}/$1/;
            chop ($title);
            print OUTPUT "<item type=\"title\">$title</item>\n";
            }

        if ($line =~/^\\author/){
            $author = $line;
            $author =~ s/^\\author{(.*)}/$1/;
            chop ($author);
            print OUTPUT "<author>$author</author>\n";
            }
    }
}

sub parse_covington
{
    $num = 1;
    $z = 0;
    $line = 1;
    while($line)
    {
        $line = $_[$z];
        if ($line =~/^\\gll/)
        {
            @wordtxt = ();
            @wordgls = ();

            #found a new patch of IGT, prepare
            print OUTPUT "<phrase id=\"$num\">\n";
            $num=$num+1;
            print OUTPUT "     <words>\n";

            $wordline = $line;
            $wordline =~s/\\gll (.*)$/$1/;
            $wordline =~s/{(.*) (.*)}/$1#$2/g ;
            @wordtxt = split (/ +/ , $wordline);
            $line2 = $_[$z+1];
            $line2 = cleanline($line2);
            @wordgls = split (/ +/ , $line2);
            $size = @wordtxt;
            for($x=0;$x<$size;$x++)
            {
                $wordtxt[$x]=noHash($wordtxt[$x]);
                $wordgls[$x]=noHash($wordgls[$x]);
                print OUTPUT "          <word>\n";
                print OUTPUT "               <item type=\"txt\">$wordtxt[$x]</item>\n";
                print OUTPUT "               <item type=\"gls\">$wordgls[$x]</item>\n";
                print OUTPUT "          </word>\n";
            }
            print OUTPUT "     </words>\n";

            $line3 = $_[$z+2];
            if ($line3 !~/\\glt/)
            {
                die "where's the translation?\n";
            } else

            {
                $trans = $line3;
                $trans =~ s/\\glt(.*)$/$1/;
                print OUTPUT "<item type=\"gls\">$trans</item>\n";
            }
            print OUTPUT "</phrase>\n";
        }
        $z++;
    }
}


sub cleanline{
        (my $str=@_[0]) =~ s/({.*?})/&rewrite($1)/ge;
    $str =~ s/[{}]//g;
        return $str;
}
sub rewrite {
        (my $str=@_[0]) =~ s/ /#/g;
        return $str;
}
sub noHash {
        (my $str=@_[0]) =~ s/#/ /g;
        return $str;
}
