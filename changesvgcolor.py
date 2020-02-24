import argparse
import os


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('color', help='base fill color in hexadecimal value (ex: 51A79A)')
    parser.add_argument('icon_path', help='Path to the icon directory')
    parser.add_argument('output_path', help='Path to the output icon directory')
    args = parser.parse_args()

    print( args.icon_path)
    print( args.output_path)
    print( args.color)
    # walk trhough all .svg file
    # for each, serach for .st0{fill:#
    # replace until ; with the "color" value
    for root, dirs, files in os.walk(args.icon_path, topdown=False):
        for f in files:
            print(f)
            if f[-4:].lower() == '.svg':
                with open(os.path.join(args.icon_path, f), 'rt') as svgtxt:
                    print( 'open ' + args.icon_path, f )
                    with open(os.path.join(args.output_path, f), 'wt') as outsvg:
                        print( 'convert to ' + os.path.join(args.output_path, f) )
                        dataline = svgtxt.readline()
                        while dataline:
                            posfillcolor = dataline.lower().find('.st0{fill:#')
                            if posfillcolor >= 0:
                                endposfill = dataline.lower().find(';}')
                                outsvg.write(dataline[:posfillcolor + 11 ] + args.color + dataline[endposfill:] )
                            else:
                                outsvg.write(dataline)
                            dataline = svgtxt.readline()
                       
